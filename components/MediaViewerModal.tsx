'use client';

import React, { useMemo, useEffect, useState } from 'react';
import { X, Share2, Download, Trash2, Check, AlertTriangle } from 'lucide-react';
import { MediaItem } from '@/lib/types';
import { deleteMediaItem } from '@/lib/db';

interface MediaViewerModalProps {
  item: MediaItem | null;
  onClose: () => void;
  onItemDeleted: (id: string) => void;
}

interface MediaViewerContentProps {
  item: MediaItem;
  onClose: () => void;
  onItemDeleted: (id: string) => void;
}

const MediaViewerContent: React.FC<MediaViewerContentProps> = ({
  item,
  onClose,
  onItemDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const mediaSrc = useMemo(() => {
    if (item.blob) {
      return URL.createObjectURL(item.blob);
    }
    return item.dataUrl || null;
  }, [item.blob, item.dataUrl]);

  useEffect(() => {
    return () => {
      if (mediaSrc && item.blob) {
        URL.revokeObjectURL(mediaSrc);
      }
    };
  }, [mediaSrc, item.blob]);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: `توثيق نشاط: ${item.title} - ${item.programName}`,
        });
      } catch {
        // Ignored
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${item.title} (${item.programName})`);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch {
        // Ignored
      }
    }
  };

  const handleDownload = () => {
    if (!mediaSrc) return;
    const a = document.createElement('a');
    a.href = mediaSrc;
    a.download = item.fileName || `${item.title}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMediaItem(item.id);
      onItemDeleted(item.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-slate-800 flex flex-col overflow-hidden text-right shadow-2xl relative">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{item.title}</h3>
            <p className="text-[11px] text-blue-400">{item.programName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="مشاركة"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
            title="تنزيل"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/50 text-red-400 hover:text-red-300 transition cursor-pointer border border-transparent hover:border-red-500/30"
            title="حذف هذه الصورة أو الفيديو"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Banner (If user clicked delete) */}
      {showConfirmDelete && (
        <div className="p-3 bg-red-950/90 border-b border-red-500/40 text-right flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>هل أنت متأكد من حذف هذه المادة نهائياً من الذاكرة؟</span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowConfirmDelete(false)}
              disabled={isDeleting}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition cursor-pointer"
            >
              تراجع
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-3.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition cursor-pointer shadow-md shadow-red-600/30"
            >
              {isDeleting ? 'جاري الحذف...' : 'نعم، حذف نهائي'}
            </button>
          </div>
        </div>
      )}

      {/* Media Frame */}
      <div className="bg-black flex items-center justify-center min-h-[45vh] max-h-[65vh] p-1">
        {item.type === 'video' ? (
          <video src={mediaSrc || undefined} controls autoPlay playsInline className="max-h-[65vh] w-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaSrc || undefined} alt={item.title} className="max-h-[65vh] w-full object-contain" />
        )}
      </div>

      {/* Bottom bar with program and date */}
      <div className="p-3 bg-slate-950 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80">
        <span>البرنامج: <strong className="text-white">{item.programName}</strong></span>
        <span>التاريخ: {item.date}</span>
      </div>
    </div>
  );
};

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  item,
  onClose,
  onItemDeleted,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <MediaViewerContent
        key={item.id}
        item={item}
        onClose={onClose}
        onItemDeleted={onItemDeleted}
      />
    </div>
  );
};
