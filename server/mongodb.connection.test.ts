import "dotenv/config";
import { describe, expect, it } from "vitest";
import { MongoClient } from "mongodb";

const itWhenMongoConfigured = process.env.MONGODB_URI ? it : it.skip;

describe("MongoDB connection", () => {
  itWhenMongoConfigured("responds to a lightweight ping with the configured secret", async () => {
    const uri = process.env.MONGODB_URI;
    expect(uri, "MONGODB_URI must be configured").toBeTruthy();

    const client = new MongoClient(uri!, { serverSelectionTimeoutMS: 8000 });
    try {
      await client.connect();
      const result = await client.db(process.env.MONGODB_DB || undefined).command({ ping: 1 });
      expect(result.ok).toBe(1);
      const collections = await client.db(process.env.MONGODB_DB || undefined).listCollections().toArray();
      expect(collections.map((collection) => collection.name)).toEqual(expect.arrayContaining(["reports", "tags"]));
    } finally {
      await client.close();
    }
  }, 15000);
});
