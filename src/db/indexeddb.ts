const DB_NAME = "NouLogDB";
const DB_VERSION = 5;

const STORE_NAMES = [
  "pvtResults",
  "ospanResults",
  "gonogoResults",
  "corsiResults",
  "taskswitchResults",
];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      // v0→v1/v2/v3: create stores
      for (const name of STORE_NAMES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      }

      // v3→v4: add uid unique index + backfill existing records
      if (oldVersion < 4) {
        const tx = request.transaction!;
        for (const name of STORE_NAMES) {
          const store = tx.objectStore(name);
          if (!store.indexNames.contains("uid")) {
            store.createIndex("uid", "uid", { unique: true });
          }
          // Backfill uid for existing records
          const cursorReq = store.openCursor();
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor) {
              const record = cursor.value;
              if (!record.uid) {
                record.uid = crypto.randomUUID();
                cursor.update(record);
              }
              cursor.continue();
            }
          };
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function put<T>(storeName: string, value: T): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(value);
    request.onsuccess = () => {
      const result = { ...value, id: request.result } as T;
      resolve(result);
    };
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

export async function importToStore<T extends { uid?: string; id?: number }>(
  storeName: string,
  records: T[],
): Promise<{ imported: number; skipped: number }> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const uidIndex = store.index("uid");
    let imported = 0;
    let skipped = 0;
    let processed = 0;

    if (records.length === 0) {
      resolve({ imported: 0, skipped: 0 });
      db.close();
      return;
    }

    for (const record of records) {
      const uid = record.uid || crypto.randomUUID();
      const checkReq = uidIndex.getKey(uid);
      checkReq.onsuccess = () => {
        if (checkReq.result !== undefined) {
          // uid already exists, skip
          skipped++;
        } else {
          // Remove original id, let autoIncrement assign new one
          const { id: _, ...rest } = record;
          const newRecord = { ...rest, uid } as unknown as T;
          store.put(newRecord);
          imported++;
        }
        processed++;
        if (processed === records.length) {
          // All records processed, let transaction complete
        }
      };
      checkReq.onerror = () => {
        processed++;
        skipped++;
      };
    }

    tx.oncomplete = () => {
      db.close();
      resolve({ imported, skipped });
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}
