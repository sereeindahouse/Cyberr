import { z } from "zod";
import { publicProcedure, router, writeProcedure } from "./_core/trpc";
import { getMongoBackend, getMongoDb, StoredReport } from "./mongodb";

const sourceSchema = z.enum(["THM", "picoCTF", "HTB", "Cloud", "Cyber"]);
const statusSchema = z.enum(["Draft", "Published"]);

// Hard caps so a single request cannot DoS the API or bloat the database.
// The express body limit (8 MB) is the outer bound; these make the contract
// explicit per field.
const reportSchema = z.object({
  id: z.number().int().positive().max(2 ** 53 - 1),
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
  archived: z.boolean().optional(),
});

const workspaceSchema = z.object({ workspaceKey: z.string().min(12).max(160) });

// Strip internal Mongo fields so clients never see storage internals.
// Real Mongo documents carry an `_id` that the `StoredReport` type omits.
function withoutMongoFields(report: StoredReport & { _id?: unknown }) {
  const {
    workspaceKey: _workspaceKey,
    updatedAt: _updatedAt,
    _id: _mongoId,
    ...publicReport
  } = report;
  return publicReport;
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
    const rows = await db.collection<StoredReport>("reports")
      .find({ workspaceKey: input.workspaceKey })
      .sort({ updatedAt: -1 })
      .toArray();
    return rows.map(withoutMongoFields);
  }),

  tags: publicProcedure.input(workspaceSchema).query(async ({ input }) => {
    const db = await getMongoDb();
    if (!db) return [];
    return db.collection<{ workspaceKey: string; tag: string }>("tags")
      .find({ workspaceKey: input.workspaceKey })
      .sort({ tag: 1 })
      .project<{ tag: string }>({ _id: 0, tag: 1 })
      .toArray()
      .then((rows) => rows.map((row) => row.tag));
  }),

  /**
   * Mirror the client's full workspace state into the database:
   * upsert every report, delete reports that are no longer in the list, and
   * rebuild the tag index from the reports that remain.
   *
   * The old upsert-only flow made deletions impossible (deleted reports
   * reappeared on the next load) and let tags accumulate forever.
   */
  sync: writeProcedure
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
      const ids = input.reports.map(report => report.id);

      if (ids.length) {
        await reportsCollection.bulkWrite(
          input.reports.map((report) => ({
            updateOne: {
              filter: { workspaceKey: input.workspaceKey, id: report.id },
              update: { $set: { ...report, workspaceKey: input.workspaceKey, updatedAt } },
              upsert: true,
            },
          }))
        );
      }

      // Delete reports that vanished from the client state. `in: []` matches
      // nothing, so an empty list is a full workspace wipe — which is what
      // "sync with zero reports" means.
      if (ids.length) {
        await reportsCollection.deleteMany({
          workspaceKey: input.workspaceKey,
          id: { $nin: ids },
        });
      } else {
        await reportsCollection.deleteMany({ workspaceKey: input.workspaceKey });
      }

      // Rebuild the tag index so removed tags stop appearing in the filter.
      const tags = Array.from(new Set(input.reports.flatMap((report) => report.tags)));
      await tagsCollection.deleteMany({ workspaceKey: input.workspaceKey });
      if (tags.length) {
        await tagsCollection.bulkWrite(
          tags.map((tag) => ({
            updateOne: {
              filter: { workspaceKey: input.workspaceKey, tag },
              update: { $set: { workspaceKey: input.workspaceKey, tag, updatedAt } },
              upsert: true,
            },
          }))
        );
      }

      return { persisted: true, count: input.reports.length };
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
        input.reports.map((report) => ({
          updateOne: {
            filter: { workspaceKey: input.workspaceKey, id: report.id },
            update: { $set: { ...report, workspaceKey: input.workspaceKey, updatedAt } },
            upsert: true,
          },
        }))
      );

      const tags = Array.from(new Set(input.reports.flatMap((report) => report.tags)));
      if (tags.length) {
        await tagsCollection.bulkWrite(
          tags.map((tag) => ({
            updateOne: {
              filter: { workspaceKey: input.workspaceKey, tag },
              update: { $set: { workspaceKey: input.workspaceKey, tag, updatedAt } },
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
        { $set: { ...input.report, workspaceKey: input.workspaceKey, updatedAt } },
        { upsert: true }
      );
      const tags = Array.from(new Set(input.report.tags));
      if (tags.length) {
        await db.collection("tags").bulkWrite(
          tags.map((tag) => ({
            updateOne: {
              filter: { workspaceKey: input.workspaceKey, tag },
              update: { $set: { workspaceKey: input.workspaceKey, tag, updatedAt } },
              upsert: true,
            },
          }))
        );
      }
      return { persisted: true };
    }),
});
