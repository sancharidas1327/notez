import { openDB } from "idb";

const DB_NAME = "notez-offline";
const DB_VERSION = 1;

let dbPromise;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Cached notes for offline browsing
        if (!db.objectStoreNames.contains("notes")) {
          db.createObjectStore("notes", { keyPath: "_id" });
        }
        // Action queue for when back online
        if (!db.objectStoreNames.contains("queue")) {
          db.createObjectStore("queue", { keyPath: "id", autoIncrement: true });
        }
        // Recently viewed note IDs
        if (!db.objectStoreNames.contains("recent")) {
          db.createObjectStore("recent", { keyPath: "_id" });
        }
      },
    });
  }
  return dbPromise;
};

// ─── Notes Cache ──────────────────────────────────────────────
export const cacheNote = async (note) => {
  const db = await getDB();
  await db.put("notes", note);
};

export const getCachedNote = async (id) => {
  const db = await getDB();
  return db.get("notes", id);
};

export const getAllCachedNotes = async () => {
  const db = await getDB();
  return db.getAll("notes");
};

// ─── Offline Action Queue ─────────────────────────────────────
export const addToOfflineQueue = async (action) => {
  const db = await getDB();
  await db.add("queue", action);
};

export const getOfflineQueue = async () => {
  const db = await getDB();
  return db.getAll("queue");
};

export const clearOfflineQueue = async () => {
  const db = await getDB();
  await db.clear("queue");
};

// ─── Recently Viewed ─────────────────────────────────────────
export const saveRecent = async (note) => {
  const db = await getDB();
  await db.put("recent", { ...note, viewedAt: Date.now() });
};

export const getRecents = async () => {
  const db = await getDB();
  const all = await db.getAll("recent");
  return all.sort((a, b) => b.viewedAt - a.viewedAt).slice(0, 10);
};
