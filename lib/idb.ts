import { openDB, DBSchema } from 'idb';

interface BackupDB extends DBSchema {
    handles: {
        key: string;
        value: FileSystemDirectoryHandle;
    };
}

const DB_NAME = 'hanamindcare-db';
const STORE_NAME = 'handles';

export async function initDB() {
    return openDB<BackupDB>(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME);
        },
    });
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle) {
    const db = await initDB();
    await db.put(STORE_NAME, handle, 'backup-dir');
}

export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | undefined> {
    const db = await initDB();
    return db.get(STORE_NAME, 'backup-dir');
}

export async function clearDirectoryHandle() {
    const db = await initDB();
    await db.delete(STORE_NAME, 'backup-dir');
}
