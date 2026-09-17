/**
 * Offline-first vault storage (Second Brain backend, step 1).
 *
 * localStorage caps at ~5 MB per origin — a handful of screenshots and the
 * vault starts throwing QuotaExceededError. IndexedDB gives the same origin
 * gigabytes, so the vault now persists here:
 *
 *   DB `operator-dossier` v1
 *   ├── `kv`     — reports, tasks, playbooks, progress, meta, UI state
 *   └── `images` — screenshot Blobs (no more base64-in-JSON bloat)
 *
 * Boot strategy (fast + lossless):
 *  1. React paints instantly from the small synchronous localStorage copy.
 *  2. `loadVault()` then reads IndexedDB; when it holds a NEWER snapshot the
 *     UI state is replaced (single silent upgrade, no flicker for new users).
 *  3. First run after this update migrates every legacy localStorage key into
 *     IndexedDB automatically.
 *
 * Writes go to IndexedDB (debounced) and — only while the payload stays under
 * ~1.5 MB — also to localStorage so cold boot stays instant. Big vaults live
 * purely in IndexedDB, which is exactly what fixes the quota crashes.
 */

export const VAULT_DB = "operator-dossier";
export const VAULT_VERSION = 1;
export const KV_STORE = "kv";
export const IMAGES_STORE = "images";

/** Above this size a value lives ONLY in IndexedDB (quota-safe). */
export const DUAL_WRITE_LIMIT_BYTES = 1_500_000;

export const LEGACY_PREFIX = "operator-dossier-";

/** localStorage key → vault kv key. Returns null for foreign keys. */
export function kvKeyFromLegacy(storageKey: string): string | null {
  if (!storageKey.startsWith(LEGACY_PREFIX)) return null;
  const key = storageKey.slice(LEGACY_PREFIX.length);
  // Only migrate keys this app owns (plus the chat history).
  if (
    key === "reports" ||
    key === "tasks" ||
    key === "playbooks" ||
    key === "track-progress" ||
    key === "workspace-key" ||
    key === "active-track" ||
    key === "public-view" ||
    key === "chat-history" ||
    key.startsWith("report-meta:")
  ) {
    return key;
  }
  return null;
}

/** Raw-string keys keep their literal value; everything else is JSON. */
export function isRawStringKey(key: string): boolean {
  return key === "workspace-key" || key === "active-track" || key === "public-view";
}

export function serializeKvValue(key: string, value: unknown): string {
  if (isRawStringKey(key)) return String(value ?? "");
  return JSON.stringify(value);
}

export function parseKvValue<T>(key: string, raw: string): T | null {
  try {
    if (isRawStringKey(key)) return raw as unknown as T;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Byte size heuristic (UTF-16 length is a fine upper bound here). */
export function estimateBytes(value: string): number {
  return value.length * 2;
}

/** Big payloads skip the localStorage mirror to avoid QuotaExceededError. */
export function shouldDualWriteToLocalStorage(serialized: string): boolean {
  return estimateBytes(serialized) <= DUAL_WRITE_LIMIT_BYTES;
}

export type KvRow = { key: string; value: string; savedAt: number };
export type ImageRow = { id: string; blob: Blob; type: string; savedAt: number };

export function vaultAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch {
    return false;
  }
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!vaultAvailable()) return Promise.reject(new Error("IndexedDB unavailable"));
  if (!dbPromise) {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(VAULT_DB, VAULT_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(KV_STORE)) {
          db.createObjectStore(KV_STORE, { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains(IMAGES_STORE)) {
          db.createObjectStore(IMAGES_STORE, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error ?? new Error("IndexedDB open failed"));
      };
      request.onblocked = () => {
        // Another tab holds the DB open — keep working, retry next call.
        dbPromise = null;
      };
    });
  }
  return dbPromise;
}

function tx<T>(store: string, mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    db =>
      new Promise<T>((resolve, reject) => {
        try {
          const transaction = db.transaction(store, mode);
          const request = run(transaction.objectStore(store));
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
        } catch (error) {
          reject(error);
        }
      })
  );
}

/** Read one kv key. Null when missing/unavailable/corrupt. */
export async function vaultGet<T>(key: string): Promise<T | null> {
  try {
    const row = await tx<KvRow | undefined>(KV_STORE, "readonly", s => s.get(key));
    if (!row) return null;
    return parseKvValue<T>(key, row.value);
  } catch {
    return null;
  }
}

/** Read every kv key (used once at boot + for backup export). */
export async function vaultGetAll(): Promise<Record<string, unknown>> {
  try {
    const rows = await tx<KvRow[]>(KV_STORE, "readonly", s => s.getAll());
    const out: Record<string, unknown> = {};
    for (const row of rows ?? []) {
      const parsed = parseKvValue(row.key, row.value);
      if (parsed !== null && parsed !== undefined) out[row.key] = parsed;
    }
    return out;
  } catch {
    return {};
  }
}

function legacyMirrorWrite(key: string, serialized: string): void {
  try {
    localStorage.setItem(`${LEGACY_PREFIX}${key}`, serialized);
  } catch {
    // Quota full — IndexedDB already holds the data, the mirror is optional.
  }
}

const pendingWrites = new Map<string, { serialized: string; timer: ReturnType<typeof setTimeout> }>();
const WRITE_DEBOUNCE_MS = 250;

function commitWrite(key: string, serialized: string): void {
  pendingWrites.delete(key);
  tx(KV_STORE, "readwrite", s =>
    s.put({ key, value: serialized, savedAt: Date.now() })
  ).catch(() => {
    // IndexedDB failed (private mode, blocked) — the localStorage mirror
    // below is the fallback, so the write is not lost for small vaults.
  });
  if (shouldDualWriteToLocalStorage(serialized)) legacyMirrorWrite(key, serialized);
}

/** Debounced persistent write. Never throws. */
export function vaultSet(key: string, value: unknown): void {
  const serialized = serializeKvValue(key, value);
  const pending = pendingWrites.get(key);
  if (pending) clearTimeout(pending.timer);
  pendingWrites.set(
    key,
    { serialized, timer: setTimeout(() => commitWrite(key, serialized), WRITE_DEBOUNCE_MS) }
  );
}

/** Flush debounced writes immediately (page hide / backup export). */
export function flushVaultWrites(): void {
  for (const [key, pending] of Array.from(pendingWrites.entries())) {
    clearTimeout(pending.timer);
    commitWrite(key, pending.serialized);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", flushVaultWrites);
}

/**
 * One-time migration of legacy localStorage keys into IndexedDB.
 * Returns the list of migrated keys (empty when nothing to do).
 */
export async function migrateLocalStorageToVault(): Promise<string[]> {
  if (!vaultAvailable()) return [];
  try {
    const existing = await tx<KvRow[]>(KV_STORE, "readonly", s => s.getAll());
    if (existing && existing.length > 0) return []; // already migrated
  } catch {
    return [];
  }
  const migrated: string[] = [];
  const rows: KvRow[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (!storageKey) continue;
      const key = kvKeyFromLegacy(storageKey);
      if (!key) continue;
      const raw = localStorage.getItem(storageKey);
      if (raw === null || raw === "") continue;
      // Validate JSON keys before migrating them.
      if (!isRawStringKey(key)) {
        try {
          JSON.parse(raw);
        } catch {
          continue;
        }
      }
      rows.push({ key, value: raw, savedAt: Date.now() });
      migrated.push(key);
    }
  } catch {
    return [];
  }
  if (!rows.length) return [];
  try {
    await openDb().then(
      db =>
        new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(KV_STORE, "readwrite");
          const store = transaction.objectStore(KV_STORE);
          for (const row of rows) store.put(row);
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(transaction.error ?? new Error("migration failed"));
        })
    );
    return migrated;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Image blobs (screenshots live here, outside the JSON snapshot)
// ---------------------------------------------------------------------------

const objectUrlCache = new Map<string, string>();

export async function saveVaultImage(id: string, blob: Blob): Promise<boolean> {
  try {
    await tx(IMAGES_STORE, "readwrite", s =>
      s.put({ id, blob, type: blob.type || "image/png", savedAt: Date.now() } satisfies ImageRow)
    );
    const stale = objectUrlCache.get(id);
    if (stale) {
      try {
        URL.revokeObjectURL(stale);
      } catch {}
      objectUrlCache.delete(id);
    }
    return true;
  } catch {
    return false;
  }
}

/** Object URL for a stored screenshot (cached, never throws). */
export async function getVaultImageUrl(id: string): Promise<string | null> {
  const hit = objectUrlCache.get(id);
  if (hit) return hit;
  try {
    const row = await tx<ImageRow | undefined>(IMAGES_STORE, "readonly", s => s.get(id));
    if (!row?.blob) return null;
    const url = URL.createObjectURL(row.blob);
    objectUrlCache.set(id, url);
    return url;
  } catch {
    return null;
  }
}

export async function deleteVaultImage(id: string): Promise<void> {
  const stale = objectUrlCache.get(id);
  if (stale) {
    try {
      URL.revokeObjectURL(stale);
    } catch {}
    objectUrlCache.delete(id);
  }
  try {
    await tx(IMAGES_STORE, "readwrite", s => s.delete(id));
  } catch {}
}

// ---------------------------------------------------------------------------
// Status / diagnostics for the profile dialog
// ---------------------------------------------------------------------------

export type VaultBackend = "indexeddb" | "localstorage" | "memory";

export async function vaultStatus(): Promise<{
  backend: VaultBackend;
  kvKeys: number;
  images: number;
  usageBytes: number | null;
  quotaBytes: number | null;
}> {
  let usageBytes: number | null = null;
  let quotaBytes: number | null = null;
  try {
    const estimate = await navigator.storage?.estimate?.();
    if (estimate) {
      usageBytes = typeof estimate.usage === "number" ? estimate.usage : null;
      quotaBytes = typeof estimate.quota === "number" ? estimate.quota : null;
    }
  } catch {}
  if (!vaultAvailable()) {
    return { backend: "localstorage", kvKeys: 0, images: 0, usageBytes, quotaBytes };
  }
  try {
    const [kv, images] = await Promise.all([
      tx<number>(KV_STORE, "readonly", s => s.count()),
      tx<number>(IMAGES_STORE, "readonly", s => s.count()),
    ]);
    return { backend: "indexeddb", kvKeys: kv ?? 0, images: images ?? 0, usageBytes, quotaBytes };
  } catch {
    return { backend: "memory", kvKeys: 0, images: 0, usageBytes, quotaBytes };
  }
}
