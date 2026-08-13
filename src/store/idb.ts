const DB_NAME = "tej-kaya";
const DB_VERSION = 1;

export type StoreName =
  | "users"
  | "sessions"
  | "rituals"
  | "journal"
  | "program"
  | "personalRituals";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("users")) {
        const users = db.createObjectStore("users", { keyPath: "id" });
        users.createIndex("email", "email", { unique: true });
      }
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("rituals")) {
        const rituals = db.createObjectStore("rituals", { keyPath: "id" });
        rituals.createIndex("userId", "userId", { unique: false });
      }
      if (!db.objectStoreNames.contains("journal")) {
        const journal = db.createObjectStore("journal", { keyPath: "id" });
        journal.createIndex("userDate", ["userId", "date"], { unique: true });
        journal.createIndex("userId", "userId", { unique: false });
      }
      if (!db.objectStoreNames.contains("program")) {
        db.createObjectStore("program", { keyPath: "userId" });
      }
      if (!db.objectStoreNames.contains("personalRituals")) {
        const pr = db.createObjectStore("personalRituals", { keyPath: "id" });
        pr.createIndex("userId", "userId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function idbPut<T>(store: StoreName, value: T): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).put(value);
  await txDone(tx);
  db.close();
}

export async function idbGet<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDb();
  const tx = db.transaction(store, "readonly");
  const req = tx.objectStore(store).get(key);
  const row = await new Promise<T | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
  await txDone(tx);
  db.close();
  return row;
}

export async function idbGetByIndex<T>(
  store: StoreName,
  index: string,
  key: IDBValidKey
): Promise<T | undefined> {
  const db = await openDb();
  const tx = db.transaction(store, "readonly");
  const req = tx.objectStore(store).index(index).get(key);
  const row = await new Promise<T | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
  await txDone(tx);
  db.close();
  return row;
}

export async function idbGetAllByIndex<T>(
  store: StoreName,
  index: string,
  key: IDBValidKey
): Promise<T[]> {
  const db = await openDb();
  const tx = db.transaction(store, "readonly");
  const req = tx.objectStore(store).index(index).getAll(key);
  const rows = await new Promise<T[]>((resolve, reject) => {
    req.onsuccess = () => resolve((req.result as T[]) || []);
    req.onerror = () => reject(req.error);
  });
  await txDone(tx);
  db.close();
  return rows;
}

export async function idbDelete(store: StoreName, key: IDBValidKey): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).delete(key);
  await txDone(tx);
  db.close();
}
