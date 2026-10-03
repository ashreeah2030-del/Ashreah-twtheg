'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Play, Film, Camera, Trash2, Check, X } from 'lucide-react';
import { MediaItem } from '@/lib/types';

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  onDelete: (id: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onClick, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const thumbUrl = useMemo(() => {
    if (item.blob) {
      return URL.createObjectURL(item.blob);
    }
    return item.dataUrl || null;
  }, [item.blob, item.dataUrl]);

  useEffect(() => {
    return () => {
      if (thumbUrl && item.blob) {
        URL.revokeObjectURL(thumbUrl);
      }
    };
  }, [thumbUrl, item.blob]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden">
        {thumbUrl && !imageError ? (
          item.type === 'video' && !item.dataUrl ? (
            <video
              src={thumbUrl}
              preload="metadata"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbUrl}
              alt={item.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-slate-500">
            {item.type === 'video' ? <Film className="w-7 h-7 text-blue-400 opacity-60" /> : <Camera className="w-7 h-7 text-emerald-400 opacity-60" />}
            <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">{item.title}</span>
          </div>
        )}

        {/* Video badge */}
        {item.type === 'video' && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-sm text-[10px] font-bold text-white z-10">
            <Play className="w-2.5 h-2.5 fill-current text-emerald-400" />
            <span>فيديو</span>
          </div>
        )}

        {/* Always Accessible Delete Trash Icon on the card */}
        <div className="absolute top-2 left-2 z-10">
          {!showConfirmDelete ? (
            <button
              onClick={handleDeleteClick}
              className="w-7 h-7 rounded-lg bg-black/70 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-sm transition cursor-pointer shadow-md"
              title="حذف هذه الصورة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            /* Quick in-card confirmation: Yes or Cancel */
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 bg-red-950/95 border border-red-500/50 p-1 rounded-xl shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
            >
              <button
                onClick={handleConfirmDelete}
                className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-0.5 transition cursor-pointer"
                title="تأكيد الحذف الآن"
              >
                <Check className="w-3 h-3" />
                <span>حذف</span>
              </button>
              <button
                onClick={handleCancelDelete}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] transition cursor-pointer"
                title="إلغاء"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 text-right">
        <div className="text-[11px] text-blue-400 font-semibold mb-0.5">
          {item.programName}
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
          {item.title}
        </h4>
        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
          <span>{item.date}</span>
          <span className="text-slate-500">{item.type === 'video' ? 'فيديو' : 'صورة'}</span>
        </div>
      </div>
    </div>
  );
};
