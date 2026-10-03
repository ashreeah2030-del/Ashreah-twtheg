export type MediaType = 'photo' | 'video';

export interface StudentProgram {
  id: string;
  name: string;
  color?: string;
  createdAt: number;
}

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  programId: string;
  programName: string;
  date: string;
  timestamp: number;
  fileSize: number;
  fileName: string;
  mimeType: string;
  duration?: number; // In seconds for video
  dataUrl?: string; // Fallback or thumbnail URL
  blob?: Blob; // Raw blob in IndexedDB
}

export const DEFAULT_PROGRAMS: StudentProgram[] = [
  { id: 'prog-1', name: 'الأنشطة الرياضية', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
  { id: 'prog-2', name: 'المعارض العلمية والابتكار', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4 },
  { id: 'prog-3', name: 'الإذاعة المدرسية', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
  { id: 'prog-4', name: 'حفل التكريم والتفوق', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2 },
];
