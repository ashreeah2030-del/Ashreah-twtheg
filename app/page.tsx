'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Video,
  Image as ImageIcon,
  FolderPlus,
  Trash2,
  Sparkles,
  Layers,
  Images,
  AlertTriangle,
  X,
} from 'lucide-react';
import { MediaItem, StudentProgram } from '@/lib/types';
import { seedInitialDataIfEmpty, deleteProgram, deleteMediaItem } from '@/lib/db';
import { MediaCard } from '@/components/MediaCard';
import { UploadModal } from '@/components/UploadModal';
import { AddProgramModal } from '@/components/AddProgramModal';
import { MediaViewerModal } from '@/components/MediaViewerModal';
import { PWAInstallButton } from '@/components/PWAInstallButton';
import { OfflineIndicator } from '@/components/OfflineIndicator';

export default function HomePage() {
  const [programs, setPrograms] = useState<StudentProgram[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Hidden native file inputs triggered by the big icons (with 'multiple' support)
  const photoCameraInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Modals state (supporting batch of multiple files)
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);
  const [isAddProgramOpen, setIsAddProgramOpen] = useState(false);
  const [activeMediaForViewer, setActiveMediaForViewer] = useState<MediaItem | null>(null);

  // In-app Program Deletion Confirmation state
  const [programToDelete, setProgramToDelete] = useState<StudentProgram | null>(null);

  // Load from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        const { programs: loadedProgs, media: loadedMedia } = await seedInitialDataIfEmpty();
        setPrograms(loadedProgs);
        setMediaItems(loadedMedia);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle files chosen from one of the upload icons (supports multiple files!)
  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingUploadFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleUploadSuccess = (newItems: MediaItem[]) => {
    setMediaItems((prev) => [...newItems, ...prev]);
    if (newItems.length > 0) {
      setSelectedProgramId(newItems[0].programId);
    }
  };

  const handleProgramAdded = (newProg: StudentProgram) => {
    setPrograms((prev) => [...prev, newProg]);
    setSelectedProgramId(newProg.id);
  };

  const confirmDeleteProgram = async () => {
    if (!programToDelete) return;
    try {
      await deleteProgram(programToDelete.id);
      setPrograms((prev) => prev.filter((p) => p.id !== programToDelete.id));
      if (selectedProgramId === programToDelete.id) {
        setSelectedProgramId('all');
      }
    } catch (err) {
      console.error('Failed to delete program:', err);
    } finally {
      setProgramToDelete(null);
    }
  };

  const handleItemDeleted = async (id: string) => {
    try {
      await deleteMediaItem(id);
      setMediaItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error('Failed to delete media item:', err);
    }
  };

  // Filter items by selected program
  const displayedItems =
    selectedProgramId === 'all'
      ? mediaItems
      : mediaItems.filter((i) => i.programId === selectedProgramId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <OfflineIndicator />

      {/* Hidden Inputs configured for Android & iPhone photo & video uploads with multiple file support */}
      <input
        ref={photoCameraInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesChosen}
        className="hidden"
      />
      <input
        ref={videoCameraInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFilesChosen}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFilesChosen}
        className="hidden"
      />

      {/* Clean, compact Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                عدسة الأنشطة الطلابية
              </h1>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                رفع وتوثيق الصور والفيديو بالجوال
              </p>
            </div>
          </div>

          {/* Install App on Android/iPhone Button */}
          <PWAInstallButton variant="compact" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 space-y-6 text-right">
        {/* SECTION 1: Action Icons (أيقونات رفع وتصوير وإدخال البرامج) */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold px-1">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>أيقونات رفع الصور والفيديوهات والبرامج:</span>
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">يدعم رفع مجموعة صور معاً</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {/* Icon 1: Upload Photos (Multiple allowed) */}
            <button
              onClick={() => photoCameraInputRef.current?.click()}
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-800/80 border border-blue-500/30 hover:border-blue-500/60 active:scale-95 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                <Images className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">رفع الصور</span>
              <span className="text-[10px] text-slate-400">صورة أو مجموعة صور</span>
            </button>

            {/* Icon 2: Upload Video */}
            <button
              onClick={() => videoCameraInputRef.current?.click()}
              className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900/40 to-slate-800/80 border border-emerald-500/30 hover:border-emerald-500/60 active:scale-95 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">رفع الفيديو</span>
              <span className="text-[10px] text-slate-400">تسجيل أو ألبوم</span>
            </button>

            {/* Icon 3: Gallery Album (Multi-select) */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-900/40 to-slate-800/80 border border-amber-500/30 hover:border-amber-500/60 active:scale-95 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/30 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">ألبوم الجوال</span>
              <span className="text-[10px] text-slate-400">تحديد عدة صور وفيديوهات</span>
            </button>

            {/* Icon 4: Add New Program */}
            <button
              onClick={() => setIsAddProgramOpen(true)}
              className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 to-slate-800/80 border border-purple-500/30 hover:border-purple-500/60 active:scale-95 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <FolderPlus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">إضافة برنامج</span>
              <span className="text-[10px] text-slate-400">نشاط أو فعالية</span>
            </button>
          </div>
        </section>

        {/* SECTION 2: Programs Bar (البرامج والأنشطة المدخلة) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>البرامج والأنشطة ({programs.length}):</span>
            </span>
            <button
              onClick={() => setIsAddProgramOpen(true)}
              className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>+ إضافة برنامج جديد</span>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {/* "All" button */}
            <button
              onClick={() => setSelectedProgramId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition cursor-pointer ${
                selectedProgramId === 'all'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              الكل ({mediaItems.length})
            </button>

            {/* User Programs */}
            {programs.map((prog) => {
              const count = mediaItems.filter((i) => i.programId === prog.id).length;
              const isSelected = selectedProgramId === prog.id;

              return (
                <div
                  key={prog.id}
                  onClick={() => setSelectedProgramId(prog.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{prog.name}</span>
                  <span className="text-[10px] opacity-75 tabular-nums">({count})</span>

                  {/* Delete Program icon if more than 1 program */}
                  {programs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProgramToDelete(prog);
                      }}
                      className="mr-1 p-0.5 rounded hover:bg-black/30 text-slate-400 hover:text-red-300 transition cursor-pointer"
                      title="حذف هذا البرنامج"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Photos and Videos Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              المواد المرفوعة:{' '}
              <strong className="text-white tabular-nums">{displayedItems.length}</strong>
            </span>
            {selectedProgramId !== 'all' && (
              <button
                onClick={() => setSelectedProgramId('all')}
                className="text-xs text-blue-400 hover:underline cursor-pointer"
              >
                عرض كل البرامج
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-slate-900 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : displayedItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayedItems.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onClick={() => setActiveMediaForViewer(item)}
                  onDelete={handleItemDeleted}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/50 border border-slate-800 text-center space-y-3 max-w-sm mx-auto my-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">لا توجد صور أو فيديوهات هنا</h3>
                <p className="text-xs text-slate-400 mt-1">
                  اضغط على أيقونة رفع الصور أو الفيديو في الأعلى لاختيار مجموعة صور ورفعها معاً!
                </p>
              </div>
              <button
                onClick={() => photoCameraInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition cursor-pointer shadow-md shadow-blue-600/30"
              >
                رفع الصور الآن
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Program Deletion Confirmation Modal (In-app, no window.confirm) */}
      {programToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 text-right shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <button
                onClick={() => setProgramToDelete(null)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">تأكيد حذف البرنامج</h3>
              <p className="text-xs text-slate-300 mt-1">
                هل أنت متأكد من حذف برنامج <strong>&quot;{programToDelete.name}&quot;</strong>؟
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                (ملاحظة: الصور المرفوعة مسبقاً لن تُحذف وستظل محفوظة).
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setProgramToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteProgram}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition cursor-pointer shadow-md shadow-red-600/30"
              >
                نعم، احذف البرنامج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Confirmation Modal (Supports batch files) */}
      <UploadModal
        isOpen={pendingUploadFiles.length > 0}
        selectedFiles={pendingUploadFiles}
        programs={programs}
        activeProgramId={selectedProgramId}
        onClose={() => setPendingUploadFiles([])}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Add Program Modal */}
      <AddProgramModal
        isOpen={isAddProgramOpen}
        onClose={() => setIsAddProgramOpen(false)}
        onProgramAdded={handleProgramAdded}
      />

      {/* Lightbox / Video Player Modal */}
      <MediaViewerModal
        item={activeMediaForViewer}
        onClose={() => setActiveMediaForViewer(null)}
        onItemDeleted={handleItemDeleted}
      />
    </div>
  );
}
