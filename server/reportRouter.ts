import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getMongoDb, StoredReport } from "./mongodb";

const sourceSchema = z.enum(["THM", "picoCTF", "HTB", "Cloud", "Cyber"]);
const statusSchema = z.enum(["Draft", "Published"]);

const reportSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  room: z.string().min(1),
  source: sourceSchema,
  stage: z.string().min(1),
  tags: z.array(z.string().min(1)),
  status: statusSchema,
  readTime: z.string(),
  date: z.string(),
  excerpt: z.string(),
  content: z.string(),
  image: z.string().optional(),
});

const workspaceSchema = z.object({ workspaceKey: z.string().min(12).max(160) });

function withoutMongoFields(report: StoredReport) {
  const { workspaceKey: _workspaceKey, updatedAt: _updatedAt, ...publicReport } = report;
  return publicReport;
}

export const reportRouter = router({
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

  upsertMany: publicProcedure.input(workspaceSchema.extend({ reports: z.array(reportSchema).min(1) })).mutation(async ({ input }) => {
    const db = await getMongoDb();
    if (!db) return { persisted: false, count: 0 };
    const reportsCollection = db.collection<StoredReport>("reports");
    const tagsCollection = db.collection("tags");
    const updatedAt = new Date();

    await reportsCollection.bulkWrite(input.reports.map((report) => ({
      updateOne: {
        filter: { workspaceKey: input.workspaceKey, id: report.id },
        update: { $set: { ...report, workspaceKey: input.workspaceKey, updatedAt } },
        upsert: true,
      },
    })));

    const tags = Array.from(new Set(input.reports.flatMap((report) => report.tags)));
    if (tags.length) {
      await tagsCollection.bulkWrite(tags.map((tag) => ({
        updateOne: {
          filter: { workspaceKey: input.workspaceKey, tag },
          update: { $set: { workspaceKey: input.workspaceKey, tag, updatedAt } },
          upsert: true,
        },
      })));
    }
    return { persisted: true, count: input.reports.length };
  }),

  upsert: publicProcedure.input(workspaceSchema.extend({ report: reportSchema })).mutation(async ({ input }) => {
    const db = await getMongoDb();
    if (!db) return { persisted: false };
    const updatedAt = new Date();
    await db.collection<StoredReport>("reports").updateOne(
      { workspaceKey: input.workspaceKey, id: input.report.id },
      { $set: { ...input.report, workspaceKey: input.workspaceKey, updatedAt } },
      { upsert: true },
    );
    const tags = Array.from(new Set(input.report.tags));
    if (tags.length) {
      await db.collection("tags").bulkWrite(tags.map((tag) => ({
        updateOne: {
          filter: { workspaceKey: input.workspaceKey, tag },
          update: { $set: { workspaceKey: input.workspaceKey, tag, updatedAt } },
          upsert: true,
        },
      })));
    }
    return { persisted: true };
  }),
});
