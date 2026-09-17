import { z } from "zod";
import { publicProcedure, router, writeProcedure } from "./_core/trpc";
import { getMongoBackend, getMongoDb, StoredReport } from "./mongodb";

const sourceSchema = z.enum(["THM", "picoCTF", "HTB", "Cloud", "Cyber"]);
const statusSchema = z.enum(["Draft", "Published"]);

// Hard caps so a single request cannot DoS the API or bloat the database.
// The express body limit (8 MB) is the outer bound; these make the contract
// explicit per field.
const reportSchema = z.object({
  id: z
    .number()
    .int()
    .positive()
    .max(2 ** 53 - 1),
  title: z.string().min(1).max(200),
  room: z.string().min(1).max(120),
  source: sourceSchema,
  stage: z.string().min(1).max(40),
  tags: z.array(z.string().min(1).max(60)).max(50),
  status: statusSchema,
  readTime: z.string().max(20),
  date: z.string().max(60),
  excerpt: z.string().max(400),
  // ~300 KB of markdown per report keeps the bundle and Mongo documents sane.
  content: z.string().max(300_000),
  // Base64 data URL for screenshots; ~1.1 MB of binary.
  image: z.string().max(1_500_000).optional(),
  // IndexedDB blob reference for >1.5 MB originals (local-only; the bytes
  // never travel to the server, but the reference syncs so other devices
  // know a screenshot exists).
  imageRef: z.string().min(1).max(120).optional(),
  // Roadmap track id (e.g. "thm-free-path") — drives track filters.
  category: z.string().min(1).max(80).optional(),
  // Original Obsidian vault path for imported notes.
  sourcePath: z.string().min(1).max(300).optional(),
  archived: z.boolean().optional(),
  // Client-reported last-modified time (ISO string). Used by `sync` to do
  // per-report last-write-wins across devices; plain upsert paths ignore it.
  updatedAt: z.string().min(1).max(60).optional(),
});

const workspaceSchema = z.object({ workspaceKey: z.string().min(12).max(160) });

// What the client is allowed to see. Mongo internals (`_id`) and the
// workspace key never leave the server; the per-report `updatedAt` IS
// exposed on purpose — multi-device sync needs it to decide which copy of a
// concurrently edited report is newer (AUDIT.md §5.5).
export type PublicReport = Omit<StoredReport, "workspaceKey" | "updatedAt"> & {
  updatedAt: string;
};

// The in-memory fallback JSON-clones documents, which turns stored Dates into
// ISO strings; real Mongo returns Dates. Normalize before comparing/serializing.
function asDate(value: unknown): Date {
  const d = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

function toPublicReport(row: StoredReport & { _id?: unknown }): PublicReport {
  const {
    workspaceKey: _workspaceKey,
    updatedAt,
    _id: _mongoId,
    ...rest
  } = row;
  return { ...rest, updatedAt: asDate(updatedAt).toISOString() };
}

// Strip the client-reported timestamp: the stored copy's `updatedAt` is set
// explicitly by the mutation, never inherited from the payload.
function toStoredFields(
  report: z.infer<typeof reportSchema>,
  workspaceKey: string
): Omit<StoredReport, "updatedAt"> {
  const { updatedAt: _clientTime, ...fields } = report;
  return { ...fields, workspaceKey };
}

export const reportRouter = router({
  // Public read: which storage backend is active? The client uses this to show
  // "cloud connected" vs "local storage" — previously it guessed from query
  // success, which is true even in the in-memory fallback mode.
  status: publicProcedure.query(async () => {
    const backend = await getMongoBackend();
    return { backend };
  }),

  list: publicProcedure.input(workspaceSchema).query(async ({ input }) => {
    const db = await getMongoDb();
    if (!db) return [];
    const rows = await db
      .collection<StoredReport>("reports")
      .find({ workspaceKey: input.workspaceKey })
      .sort({ updatedAt: -1 })
      .toArray();
    return rows.map(toPublicReport);
  }),

  tags: publicProcedure.input(workspaceSchema).query(async ({ input }) => {
    const db = await getMongoDb();
    if (!db) return [];
    return db
      .collection<{ workspaceKey: string; tag: string }>("tags")
      .find({ workspaceKey: input.workspaceKey })
      .sort({ tag: 1 })
      .project<{ tag: string }>({ _id: 0, tag: 1 })
      .toArray()
      .then(rows => rows.map(row => row.tag));
  }),

  /**
   * Mirror the client's workspace state into the database — but with
   * per-report last-write-wins instead of whole-workspace last-write-wins
   * (AUDIT.md §5.5, the "real multi-device conflict handling" step):
   *
   * - each incoming report carries the timestamp the client last knew for
   *   it; if the stored copy is NEWER, the server keeps its own version and
   *   returns it, so edits made on another device survive this sync;
   * - deletions are tombstones: the client also sends `seenIds` (every id it
   *   has ever known). The server deletes ids the client knows and now
   *   dropped, but KEEPS ids the client never saw — a fresh device that just
   *   adopted the workspace key cannot wipe the vault on its first sync;
   * - the response is the full post-merge workspace state (with per-report
   *   `updatedAt`) so the client adopts exactly what the server has.
   *
   * Legacy clients that omit `seenIds` get the old full-mirror semantics
   * (delete everything not in the list), so the change is backward
   * compatible.
   */
  sync: writeProcedure
    .input(
      workspaceSchema.extend({
        reports: z.array(reportSchema).max(500),
        seenIds: z.array(z.number().int().positive()).max(2000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getMongoDb();
      if (!db) {
        return { persisted: false, count: 0, reports: [] as PublicReport[] };
      }

      const reportsCollection = db.collection<StoredReport>("reports");
      const existingRows = await reportsCollection
        .find({ workspaceKey: input.workspaceKey })
        .toArray();
      const existingById = new Map<number, StoredReport>(
        existingRows.map(row => [row.id, row])
      );
      const incomingIds = new Set(input.reports.map(report => report.id));
      const seenIds =
        input.seenIds === undefined ? null : new Set(input.seenIds);

      // 1. Accept incoming reports whose copy is at least as fresh as the
      //    stored one. Missing timestamps (legacy clients) mean "just
      //    changed now", which is what old upserts assumed as well.
      const writes: Array<{
        updateOne: {
          filter: { workspaceKey: string; id: number };
          update: { $set: StoredReport };
          upsert: boolean;
        };
      }> = [];
      for (const report of input.reports) {
        let incomingAt = new Date();
        if (report.updatedAt) {
          const parsed = new Date(report.updatedAt);
          if (!Number.isNaN(parsed.getTime())) incomingAt = parsed;
        }
        const existing = existingById.get(report.id);
        if (
          existing &&
          asDate(existing.updatedAt).getTime() > incomingAt.getTime()
        ) {
          continue; // server keeps the newer copy; it lands in the final state
        }
        writes.push({
          updateOne: {
            filter: { workspaceKey: input.workspaceKey, id: report.id },
            update: {
              $set: {
                ...toStoredFields(report, input.workspaceKey),
                updatedAt: incomingAt,
              },
            },
            upsert: true,
          },
        });
      }
      if (writes.length) {
        await reportsCollection.bulkWrite(writes);
      }

      // 2. Deletions. Known-and-dropped ids are real deletions; ids the
      //    client never saw are kept (new-device safety) and returned below.
      if (seenIds === null) {
        // Legacy full-mirror semantics: the list is authoritative.
        if (incomingIds.size) {
          await reportsCollection.deleteMany({
            workspaceKey: input.workspaceKey,
            id: { $nin: Array.from(incomingIds) },
          });
        } else {
          await reportsCollection.deleteMany({
            workspaceKey: input.workspaceKey,
          });
        }
      } else {
        const toDelete = existingRows
          .filter(row => !incomingIds.has(row.id) && seenIds.has(row.id))
          .map(row => row.id);
        if (toDelete.length) {
          await reportsCollection.deleteMany({
            workspaceKey: input.workspaceKey,
            id: { $in: toDelete },
          });
        }
      }

      // 3. Rebuild the tag index from the FINAL state so tags of
      //    server-kept copies (and server-only reports) keep working.
      const finalRows = await reportsCollection
        .find({ workspaceKey: input.workspaceKey })
        .sort({ updatedAt: -1 })
        .toArray();
      const tags = Array.from(new Set(finalRows.flatMap(row => row.tags)));
      const tagsCollection = db.collection("tags");
      await tagsCollection.deleteMany({ workspaceKey: input.workspaceKey });
      if (tags.length) {
        const tagTime = new Date();
        await tagsCollection.bulkWrite(
          tags.map(tag => ({
            updateOne: {
              filter: { workspaceKey: input.workspaceKey, tag },
              update: {
                $set: {
                  workspaceKey: input.workspaceKey,
                  tag,
                  updatedAt: tagTime,
                },
              },
              upsert: true,
            },
          }))
        );
      }

      return {
        persisted: true,
        count: finalRows.length,
        reports: finalRows.map(toPublicReport),
      };
    }),

  upsertMany: writeProcedure
    .input(
      workspaceSchema.extend({
        reports: z.array(reportSchema).max(500),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getMongoDb();
      if (!db) return { persisted: false, count: 0 };
      const reportsCollection = db.collection<StoredReport>("reports");
      const tagsCollection = db.collection("tags");
      const updatedAt = new Date();

      await reportsCollection.bulkWrite(
        input.reports.map(report => ({
          updateOne: {
            filter: { workspaceKey: input.workspaceKey, id: report.id },
            update: {
              $set: {
                ...toStoredFields(report, input.workspaceKey),
                updatedAt,
              } as StoredReport,
            },
            upsert: true,
          },
        }))
      );

      const tags = Array.from(
        new Set(input.reports.flatMap(report => report.tags))
      );
      if (tags.length) {
        await tagsCollection.bulkWrite(
          tags.map(tag => ({
            updateOne: {
              filter: { workspaceKey: input.workspaceKey, tag },
              update: {
                $set: { workspaceKey: input.workspaceKey, tag, updatedAt },
              },
              upsert: true,
            },
          }))
        );
      }
      return { persisted: true, count: input.reports.length };
    }),

  upsert: writeProcedure
    .input(workspaceSchema.extend({ report: reportSchema }))
    .mutation(async ({ input }) => {
      const db = await getMongoDb();
      if (!db) return { persisted: false };
      const updatedAt = new Date();
      await db.collection<StoredReport>("reports").updateOne(
        { workspaceKey: input.workspaceKey, id: input.report.id },
        {
          $set: {
            ...toStoredFields(input.report, input.workspaceKey),
            updatedAt,
          } as StoredReport,
        },
        { upsert: true }
      );
      const tags = Array.from(new Set(input.report.tags));
      if (tags.length) {
        await db.collection("tags").bulkWrite(
          tags.map(tag => ({
            updateOne: {
              filter: { workspaceKey: input.workspaceKey, tag },
              update: {
                $set: { workspaceKey: input.workspaceKey, tag, updatedAt },
              },
              upsert: true,
            },
          }))
        );
      }
      return { persisted: true };
    }),
});
