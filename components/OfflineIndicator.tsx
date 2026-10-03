'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-top duration-300">
        <Wifi className="w-3.5 h-3.5" />
        <span>تمت استعادة الاتصال بالإنترنت</span>
      </div>
    );
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600/95 border border-amber-400/40 px-4 py-1.5 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-top duration-300">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>وضع عدم الاتصال — يمكنك التقاط وتخزين الصور محلياً على جهازك</span>
    </div>
  );
};
