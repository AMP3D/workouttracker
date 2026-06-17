import { type IDBPDatabase, openDB } from 'idb';
import { DB_NAME, DB_VERSION, STORE_DAY_WORKOUTS, STORE_TEMPLATES } from '../models';

let dbInstance: IDBPDatabase | null = null;

export const getDb = async (): Promise<IDBPDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      if (!db.objectStoreNames.contains(STORE_TEMPLATES)) {
        db.createObjectStore(STORE_TEMPLATES, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORE_DAY_WORKOUTS)) {
        const workoutStore = db.createObjectStore(STORE_DAY_WORKOUTS, { keyPath: 'id' });
        workoutStore.createIndex('date', 'date', { unique: false });
      } else if (oldVersion < 2) {
        const store = transaction.objectStore(STORE_DAY_WORKOUTS);
        store.deleteIndex('date');
        store.createIndex('date', 'date', { unique: false });
      }
    },
  });

  return dbInstance;
};

export const resetDbInstance = (): void => {
  dbInstance = null;
};
