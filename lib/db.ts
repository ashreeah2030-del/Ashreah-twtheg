import { MediaItem, StudentProgram, DEFAULT_PROGRAMS } from './types';

const DB_NAME = 'StudentActivitiesSimpleDB';
const DB_VERSION = 2;
const MEDIA_STORE = 'media_items';
const PROGRAMS_STORE = 'programs';

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available on server'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        const mediaStore = db.createObjectStore(MEDIA_STORE, { keyPath: 'id' });
        mediaStore.createIndex('timestamp', 'timestamp', { unique: false });
        mediaStore.createIndex('programId', 'programId', { unique: false });
      }
      if (!db.objectStoreNames.contains(PROGRAMS_STORE)) {
        const progStore = db.createObjectStore(PROGRAMS_STORE, { keyPath: 'id' });
        progStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// Programs Operations
export async function getAllPrograms(): Promise<StudentProgram[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROGRAMS_STORE, 'readonly');
      const store = tx.objectStore(PROGRAMS_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const result = (req.result as StudentProgram[]) || [];
        resolve(result);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Failed to get programs:', error);
    return [];
  }
}

export async function saveProgram(program: StudentProgram): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRAMS_STORE, 'readwrite');
    const store = tx.objectStore(PROGRAMS_STORE);
    const req = store.put(program);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteProgram(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRAMS_STORE, 'readwrite');
    const store = tx.objectStore(PROGRAMS_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Media Operations
export async function getAllMediaItems(): Promise<MediaItem[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readonly');
      const store = tx.objectStore(MEDIA_STORE);
      const index = store.index('timestamp');
      const items: MediaItem[] = [];
      const cursorReq = index.openCursor(null, 'prev');

      cursorReq.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          items.push(cursor.value as MediaItem);
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      cursorReq.onerror = () => reject(cursorReq.error);
    });
  } catch (error) {
    console.error('Failed to get media items from IndexedDB:', error);
    return [];
  }
}

export async function saveMediaItem(item: MediaItem): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function deleteMediaItem(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(MEDIA_STORE, 'readwrite');
    const store = tx.objectStore(MEDIA_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Generate simple SVG for demo media
function createDemoSvgUrl(title: string, category: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
    <rect width="600" height="400" fill="#0f172a"/>
    <circle cx="300" cy="170" r="80" fill="${color}" fill-opacity="0.25"/>
    <circle cx="300" cy="170" r="45" fill="${color}"/>
    <text x="300" y="300" fill="#f8fafc" font-size="22" font-weight="bold" font-family="system-ui, sans-serif" text-anchor="middle" direction="rtl">${title}</text>
    <text x="300" y="340" fill="${color}" font-size="16" font-family="system-ui, sans-serif" text-anchor="middle" direction="rtl">${category}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Seed initial data if first time
export async function seedInitialDataIfEmpty(): Promise<{
  programs: StudentProgram[];
  media: MediaItem[];
}> {
  let programs = await getAllPrograms();
  if (programs.length === 0) {
    for (const p of DEFAULT_PROGRAMS) {
      await saveProgram(p);
    }
    programs = DEFAULT_PROGRAMS;
  }

  let media = await getAllMediaItems();
  if (media.length === 0) {
    const sampleMedia: MediaItem[] = [
      {
        id: 'sample-1',
        title: 'مباراة نهائي دوري الفصول',
        type: 'photo',
        programId: programs[0]?.id || 'prog-1',
        programName: programs[0]?.name || 'الأنشطة الرياضية',
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
        fileSize: 1840000,
        fileName: 'sports_match.jpg',
        mimeType: 'image/jpeg',
        dataUrl: createDemoSvgUrl('نهائي دوري كرة القدم', 'الأنشطة الرياضية', '#10b981'),
      },
      {
        id: 'sample-2',
        title: 'عرض روبوت الفرز الذكي',
        type: 'video',
        programId: programs[1]?.id || 'prog-2',
        programName: programs[1]?.name || 'المعارض العلمية والابتكار',
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now() - 1000 * 60 * 60 * 5,
        fileSize: 12500000,
        fileName: 'robot_demo.mp4',
        mimeType: 'video/mp4',
        duration: 35,
        dataUrl: createDemoSvgUrl('فيديو تجربة الروبوت', 'المعارض العلمية', '#3b82f6'),
      },
      {
        id: 'sample-3',
        title: 'الإذاعة الصباحية',
        type: 'photo',
        programId: programs[2]?.id || 'prog-3',
        programName: programs[2]?.name || 'الإذاعة المدرسية',
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now() - 1000 * 60 * 60 * 24,
        fileSize: 1450000,
        fileName: 'radio.jpg',
        mimeType: 'image/jpeg',
        dataUrl: createDemoSvgUrl('إذاعة الصباح المدرسية', 'الإذاعة المدرسية', '#f59e0b'),
      },
    ];

    for (const m of sampleMedia) {
      await saveMediaItem(m);
    }
    media = sampleMedia;
  }

  return { programs, media };
}
