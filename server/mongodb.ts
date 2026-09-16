import { Db, MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient> | null = null;

const memoryCollections = new Map<string, Map<string, Record<string, unknown>>>();

type MemoryDocument = Record<string, unknown>;

function matchFilter(doc: MemoryDocument, filter: Record<string, unknown>): boolean {
  return Object.entries(filter).every(([key, expected]) => {
    if (expected === undefined) return true;
    if (
      typeof expected === "object" &&
      expected !== null &&
      !(expected instanceof Date) &&
      !Array.isArray(expected)
    ) {
      // Minimal query-operator support for the in-memory fallback: { $in, $nin }
      const value = doc[key];
      if ("$nin" in expected) {
        return !(expected.$nin as unknown[]).includes(value);
      }
      if ("$in" in expected) {
        return (expected.$in as unknown[]).includes(value);
      }
      return JSON.stringify(value) === JSON.stringify(expected);
    }
    return doc[key] === expected;
  });
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function createMemoryDb(): Db {
  const db = {
    collection<T = MemoryDocument>(name: string) {
      if (!memoryCollections.has(name)) {
        memoryCollections.set(name, new Map());
      }

      const store = memoryCollections.get(name)!;

      const collection = {
        find(filter: Record<string, unknown> = {}) {
          const rows = Array.from(store.values()).filter((doc) => matchFilter(doc, filter));
          let working = [...rows];

          return {
            sort(sortSpec: Record<string, number>) {
              const entries = Object.entries(sortSpec);
              if (!entries.length) return this;
              working = [...working].sort((a, b) => {
                for (const [key, direction] of entries) {
                  const left = a[key] as number | string | Date;
                  const right = b[key] as number | string | Date;
                  if (left === right) continue;
                  if (left instanceof Date && right instanceof Date) {
                    return (left.getTime() - right.getTime()) * (direction >= 0 ? 1 : -1);
                  }
                  if (typeof left === "number" && typeof right === "number") {
                    return (left - right) * (direction >= 0 ? 1 : -1);
                  }
                  return String(left).localeCompare(String(right)) * (direction >= 0 ? 1 : -1);
                }
                return 0;
              });
              return this;
            },
            project(projection: Record<string, number> = {}) {
              const keep = Object.entries(projection)
                .filter(([, included]) => included !== 0)
                .map(([field]) => field);
              const projected = working.map((doc) => {
                if (!keep.length || keep.includes("_id")) return { ...doc };
                const picked: MemoryDocument = {};
                for (const field of keep) {
                  if (field in doc) picked[field] = clone(doc[field]);
                }
                return picked;
              });
              working = projected;
              return this;
            },
            // The real driver returns a Promise; the router code chains
            // `.toArray().then(...)`, so the fallback must too.
            toArray() {
              return Promise.resolve(clone(working));
            },
          };
        },
        deleteMany(filter: Record<string, unknown> = {}) {
          let deleted = 0;
          for (const [key, doc] of Array.from(store.entries())) {
            if (matchFilter(doc, filter)) {
              store.delete(key);
              deleted += 1;
            }
          }
          return { acknowledged: true, deletedCount: deleted };
        },
        updateOne(filter: Record<string, unknown>, update: { $set?: Record<string, unknown> }, options?: { upsert?: boolean }) {
          const existing = Array.from(store.values()).find((doc) => matchFilter(doc, filter));
          const nextValues = update.$set ?? {};
          const target = existing ?? { ...filter };

          Object.assign(target, nextValues, { ...filter });
          const key = String((target as any)._id ?? `${Math.random().toString(36).slice(2)}-${Date.now()}`);
          (target as any)._id = key;
          store.set(key, target);

          return { acknowledged: true, matchedCount: existing ? 1 : 0, modifiedCount: existing ? 1 : 0, upsertedCount: existing ? 0 : 1 };
        },
        async bulkWrite(operations: Array<{ updateOne: { filter: Record<string, unknown>; update: { $set?: Record<string, unknown> }; upsert?: boolean } }>) {
          for (const operation of operations) {
            this.updateOne(operation.updateOne.filter, operation.updateOne.update, { upsert: operation.updateOne.upsert });
          }
          return { acknowledged: true, insertedCount: operations.length, matchedCount: operations.length };
        },
      };

      return collection as any;
    },
    command() {
      return { ok: 1 };
    },
  } as any;

  return db;
}

function getMongoUri() {
  return process.env.MONGODB_URI;
}

export type MongoBackend = "memory" | "mongodb";

/**
 * Which storage backend report data currently lives in.
 * "memory" means MONGODB_URI is unset and everything is in-process RAM —
 * it does NOT survive a restart, and the client should say "local" not
 * "cloud connected".
 */
export async function getMongoBackend(): Promise<MongoBackend> {
  return getMongoUri() ? "mongodb" : "memory";
}

export async function getMongoDb(): Promise<Db | null> {
  const uri = getMongoUri();

  if (!uri) {
    return createMemoryDb();
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  const configuredName = process.env.MONGODB_DB;
  return configuredName ? client.db(configuredName) : client.db();
}

export async function ensureMongoCollections(): Promise<void> {
  if (!getMongoUri()) return;

  const db = await getMongoDb();
  if (!db) return;

  for (const name of ["reports", "tags"]) {
    try {
      await db.createCollection(name);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("already exists")) {
        throw error;
      }
    }
  }

  await db.collection("reports").createIndex({ workspaceKey: 1, id: 1 }, { unique: true });
  await db.collection("reports").createIndex({ workspaceKey: 1, updatedAt: -1 });
  await db.collection("tags").createIndex({ workspaceKey: 1, tag: 1 }, { unique: true });
}

export type StoredReport = {
  workspaceKey: string;
  id: number;
  title: string;
  room: string;
  source: "THM" | "picoCTF" | "HTB" | "Cloud" | "Cyber";
  stage: string;
  tags: string[];
  status: "Draft" | "Published";
  readTime: string;
  date: string;
  excerpt: string;
  content: string;
  image?: string;
  archived?: boolean;
  updatedAt: Date;
};
