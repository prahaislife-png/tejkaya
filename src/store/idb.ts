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

function request<T>(run: (db: IDBDatabase) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const req = run(db);
        req.onsuccess = () => {
          resolve(req.result);
          db.close();
        };
        req.onerror = () => {
          reject(req.error);
          db.close();
        };
      })
  );
}

export async function idbPut<T>(store: StoreName, value: T): Promise<void> {
  await request((db) => db.transaction(store, "readwrite").objectStore(store).put(value));
}

export async function idbGet<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const row = await request((db) => db.transaction(store, "readonly").objectStore(store).get(key));
  return row as T | undefined;
}

export async function idbGetByIndex<T>(
  store: StoreName,
  index: string,
  key: IDBValidKey
): Promise<T | undefined> {
  const row = await request((db) => db.transaction(store, "readonly").objectStore(store).index(index).get(key));
  return row as T | undefined;
}

export async function idbGetAllByIndex<T>(
  store: StoreName,
  index: string,
  key: IDBValidKey
): Promise<T[]> {
  const rows = await request((db) => db.transaction(store, "readonly").objectStore(store).index(index).getAll(key));
  return (rows as T[]) || [];
}

export async function idbDelete(store: StoreName, key: IDBValidKey): Promise<void> {
  await request((db) => db.transaction(store, "readwrite").objectStore(store).delete(key));
}
