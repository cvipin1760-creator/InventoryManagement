export interface OfflineRequest {
  id?: number;
  url: string;
  method: string;
  body: string;
  headers: Record<string, string>;
  timestamp: number;
}

const DB_NAME = 'stockpilot_offline_db';
const STORE_REQUESTS = 'offline_requests';

export class OfflineSyncService {
  private static async getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_REQUESTS)) {
          db.createObjectStore(STORE_REQUESTS, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  static async queueRequest(request: Omit<OfflineRequest, 'id'>): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REQUESTS, 'readwrite');
      const store = tx.objectStore(STORE_REQUESTS);
      const req = store.add(request);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async getQueuedRequests(): Promise<OfflineRequest[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REQUESTS, 'readonly');
      const store = tx.objectStore(STORE_REQUESTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  static async removeRequest(id: number): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REQUESTS, 'readwrite');
      const store = tx.objectStore(STORE_REQUESTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async syncNow(): Promise<void> {
    if (!navigator.onLine) return;
    
    const requests = await this.getQueuedRequests();
    if (requests.length === 0) return;

    for (const req of requests) {
      try {
        await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });
        if (req.id) await this.removeRequest(req.id);
      } catch (e) {
        console.error('Offline sync failed for request', req, e);
      }
    }
  }

  static init() {
    window.addEventListener('online', () => {
      this.syncNow();
    });
  }
}
