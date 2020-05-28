export const DB_NAME = "drinky";
export const DB_COLLECTION = "drink-events";

export const getDb = (version: number = 1) =>
  new Promise<IDBDatabase>((res, rej) => {
    try {
      const request = indexedDB.open(DB_NAME, version);
      request.onupgradeneeded = event => {
        try {
          var db = (event.target as any).result as IDBDatabase;
          db.createObjectStore("drink-events", {
            keyPath: "id",
            autoIncrement: true
          });
        } catch (e) {
          rej(e);
        }
      };
      request.onsuccess = event => {
        try {
          var db = (event.target as any).result as IDBDatabase;
          res(db);
        } catch (e) {
          rej(e);
        }
      };
    } catch (e) {
      rej(e);
    }
  });

export const insert = ({ amount, date }: { amount: number; date: number }) =>
  new Promise(async (res, rej) => {
    const db = await getDb();
    const transaction = db.transaction(DB_COLLECTION, "readwrite");
    const store = transaction.objectStore(DB_COLLECTION);
    store.add({ amount, date });
    transaction.onerror = e => rej((e.target as any).error);
    transaction.oncomplete = res;
  });

export interface DrinkDataEntry {
  amount: number;
  date: number;
  $key: string;
}

export const readAll = ({
  fromDate = -Infinity,
  toDate = Infinity
}: {
  fromDate?: number;
  toDate?: number;
} = {}) =>
  new Promise<DrinkDataEntry[]>(async (res, rej) => {
    const db = await getDb();
    const data: DrinkDataEntry[] = [];
    db
      .transaction(DB_COLLECTION)
      .objectStore(DB_COLLECTION)
      .openCursor().onsuccess = event => {
      var cursor = (event.target as any).result as IDBCursorWithValue;
      if (cursor) {
        const { amount, date } = cursor.value;
        if (date >= fromDate && date < toDate) {
          data.push({
            $key: cursor.key.toString(),
            amount: amount,
            date: date
          });
        }
        cursor.continue();
      } else {
        res(data);
      }
    };
  });
