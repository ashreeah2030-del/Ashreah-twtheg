'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Check, Loader2, Video, Camera, Trash2, Plus } from 'lucide-react';
import { MediaItem, StudentProgram } from '@/lib/types';
import { saveMediaItem } from '@/lib/db';

interface UploadModalProps {
  isOpen: boolean;
  selectedFiles: File[];
  programs: StudentProgram[];
  activeProgramId: string | 'all';
  onClose: () => void;
  onUploadSuccess: (items: MediaItem[]) => void;
}

interface UploadFormContentProps {
  initialFiles: File[];
  programs: StudentProgram[];
  activeProgramId: string | 'all';
  onClose: () => void;
  onUploadSuccess: (items: MediaItem[]) => void;
}

interface FilePreviewItem {
  file: File;
  url: string;
  isVideo: boolean;
}

const UploadFormContent: React.FC<UploadFormContentProps> = ({
  initialFiles,
  programs,
  activeProgramId,
  onClose,
  onUploadSuccess,
}) => {
  const [files, setFiles] = useState<File[]>(initialFiles);

  const defaultProg = useMemo(() => {
    return activeProgramId !== 'all' && programs.some((p) => p.id === activeProgramId)
      ? activeProgramId
      : programs[0]?.id || '';
  }, [activeProgramId, programs]);

  const [selectedProgId, setSelectedProgId] = useState<string>(defaultProg);
  const [title, setTitle] = useState<string>(() => {
    const progName = programs.find((p) => p.id === defaultProg)?.name || 'نشاط مدرسي';
    if (initialFiles.length === 1) {
      const cleanFileName = initialFiles[0].name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();
      if (cleanFileName && !cleanFileName.startsWith('IMG') && !cleanFileName.startsWith('VID')) {
        return cleanFileName;
      }
    }
    return `توثيق ${progName}`;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  // Create preview URLs safely
  const previewItems: FilePreviewItem[] = useMemo(() => {
    return files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith('video/'),
    }));
  }, [files]);

  // Clean up object URLs on change or unmount
  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewItems]);

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    if (updated.length === 0) {
      onClose();
    } else {
      setFiles(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setIsSubmitting(true);
    setUploadProgress({ current: 0, total: files.length });

    try {
      const prog = programs.find((p) => p.id === selectedProgId) || programs[0];
      const progName = prog?.name || 'برنامج عام';
      const baseTitle = title.trim() || `توثيق ${progName}`;
      const savedItems: MediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVideo = file.type.startsWith('video/');
        const itemTitle =
          files.length === 1
            ? baseTitle
            : `${baseTitle} (${i + 1})`;

        const newItem: MediaItem = {
          id: `media-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          title: itemTitle,
          type: isVideo ? 'video' : 'photo',
          programId: prog?.id || 'prog-default',
          programName: progName,
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now() + i, // slight offset for stable sorting
          fileSize: file.size,
          fileName: file.name,
          mimeType: file.type,
          blob: file,
          dataUrl: previewItems[i]?.url || undefined,
        };

        await saveMediaItem(newItem);
        savedItems.push(newItem);
        setUploadProgress({ current: i + 1, total: files.length });
      }

      onUploadSuccess(savedItems);
      onClose();
    } catch (err) {
      console.error('Failed to save files:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-5 text-right shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            {files.length}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              {files.length > 1 ? `رفع مجموعة صور وفيديوهات (${files.length})` : 'رفع وتوثيق الوسائط'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {files.length > 1 ? 'سيتم حفظ جميع الملفات المختارة دفعة واحدة' : 'معاينة الملف وحفظه'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Media Previews Grid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>الملفات المحددة ({files.length}):</span>
          <span className="text-[11px] text-slate-500">انقر ✕ لحذف صورة من المجموعة</span>
        </div>

        <div className="max-h-52 overflow-y-auto rounded-xl bg-slate-950 p-2 border border-slate-800">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {previewItems.map((item, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-lg overflow-hidden bg-black border border-slate-800 group"
              >
                {item.isVideo ? (
                  <video src={item.url} className="w-full h-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={`صورة ${idx + 1}`} className="w-full h-full object-cover" />
                )}

                {item.isVideo && (
                  <div className="absolute bottom-1 right-1 p-0.5 rounded bg-black/75 text-emerald-400">
                    <Video className="w-3 h-3" />
                  </div>
                )}

                {/* Remove individual photo button */}
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="absolute top-1 left-1 w-5 h-5 rounded-full bg-red-600/90 text-white flex items-center justify-center hover:bg-red-500 transition cursor-pointer"
                  title="إزالة هذه الصورة"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Select Program */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            اختر البرنامج التابع له للمجموعة
          </label>
          <select
            value={selectedProgId}
            onChange={(e) => setSelectedProgId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Title input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            عنوان أو وصف الفعالية
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: صور مباراة دوري الفصول"
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {isSubmitting ? (
              <span className="text-blue-400 font-medium">
                جاري رفع {uploadProgress.current} من {uploadProgress.total}...
              </span>
            ) : (
              <span>المجموع: {files.length} ملف</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-md shadow-blue-600/30"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {files.length > 1 ? `رفع ${files.length} صور الآن` : 'رفع الصورة'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  selectedFiles,
  programs,
  activeProgramId,
  onClose,
  onUploadSuccess,
}) => {
  if (!isOpen || selectedFiles.length === 0) return null;

  // Use keys combined to remount fresh state when file array changes
  const filesKey = selectedFiles.map((f) => f.name + f.size).join('-');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <UploadFormContent
        key={filesKey}
        initialFiles={selectedFiles}
        programs={programs}
        activeProgramId={activeProgramId}
        onClose={onClose}
        onUploadSuccess={onUploadSuccess}
      />
    </div>
  );
};
