import { describe, expect, it } from "vitest";
import {
  DUAL_WRITE_LIMIT_BYTES,
  estimateBytes,
  isRawStringKey,
  kvKeyFromLegacy,
  parseKvValue,
  serializeKvValue,
  shouldDualWriteToLocalStorage,
  vaultAvailable,
} from "./vault";

describe("kvKeyFromLegacy", () => {
  it("maps owned keys and rejects foreign ones", () => {
    expect(kvKeyFromLegacy("operator-dossier-reports")).toBe("reports");
    expect(kvKeyFromLegacy("operator-dossier-report-meta:abc")).toBe("report-meta:abc");
    expect(kvKeyFromLegacy("operator-dossier-chat-history")).toBe("chat-history");
    expect(kvKeyFromLegacy("operator-dossier-active-track")).toBe("active-track");
    expect(kvKeyFromLegacy("theme")).toBeNull();
    expect(kvKeyFromLegacy("operator-dossier-evil")).toBeNull();
  });
});

describe("isRawStringKey / serialize / parse round-trip", () => {
  it("keeps workspace keys as raw strings", () => {
    expect(isRawStringKey("workspace-key")).toBe(true);
    expect(isRawStringKey("reports")).toBe(false);
    expect(serializeKvValue("workspace-key", "workspace-123")).toBe("workspace-123");
    expect(parseKvValue<string>("workspace-key", "workspace-123")).toBe("workspace-123");
  });

  it("round-trips JSON values", () => {
    const value = [{ id: 1, tags: ["a"] }];
    const raw = serializeKvValue("reports", value);
    expect(parseKvValue("reports", raw)).toEqual(value);
  });

  it("returns null for corrupt JSON", () => {
    expect(parseKvValue("reports", "{oops")).toBeNull();
  });
});

describe("shouldDualWriteToLocalStorage", () => {
  it("mirrors small payloads and skips big ones", () => {
    expect(shouldDualWriteToLocalStorage(JSON.stringify({ a: 1 }))).toBe(true);
    expect(shouldDualWriteToLocalStorage("x".repeat(DUAL_WRITE_LIMIT_BYTES))).toBe(false);
    expect(estimateBytes("ab")).toBe(4);
  });
});

describe("vaultAvailable", () => {
  it("is false in the node test env (browser-only API)", () => {
    expect(vaultAvailable()).toBe(false);
  });
});
