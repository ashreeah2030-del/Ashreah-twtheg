'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, Smartphone, Share, PlusSquare, X, CheckCircle2 } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed and running standalone, do not show install prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions for other browsers / Android when prompt is not yet ready
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">تثبيت التطبيق على جوالك</h4>
              <p className="text-xs text-slate-300">
                يعمل كتطبيق أصلي سريع على أندرويد وآيفون لرفع وتصوير الأنشطة المدرسية
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isIOS ? 'تثبيت على آيفون (iOS)' : 'تثبيت على أندرويد / الجوال'}
          </button>
        </div>
      ) : variant === 'compact' ? (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-medium text-blue-300 transition cursor-pointer"
          title="تثبيت التطبيق على الجوال"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت التطبيق</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-700/25 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isIOS ? 'تثبيت على الآيفون' : 'تثبيت كتطبيق للجوال'}
          </span>
          <span className="sm:hidden">تثبيت</span>
        </button>
      )}

      {/* Guide Dialog for iOS and other browsers */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-right relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute left-4 top-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {isIOS ? 'خطوات التثبيت على آيفون (iOS)' : 'طريقة تثبيت التطبيق على هاتفك'}
                </h3>
                <p className="text-xs text-slate-400">لفتح التطبيق فورياً من الشاشة الرئيسية بدون متصفح</p>
              </div>
            </div>

            <div className="space-y-3.5 my-5 text-sm">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  1
                </div>
                <div className="text-xs text-slate-200 leading-relaxed">
                  {isIOS ? (
                    <>
                      اضغط على زر <strong>المشاركة (Share)</strong>{' '}
                      <span className="inline-flex items-center justify-center p-1 rounded bg-slate-700 text-blue-400 mx-1">
                        <Share className="w-3.5 h-3.5 inline" />
                      </span>{' '}
                      في أسفل شاشة متصفح سفاري (Safari).
                    </>
                  ) : (
                    <>
                      افتح قائمة الخيارات (الثلاث نقاط في أعلى أو أسفل المتصفح) في متصفح كروم أو المتصفح لديك.
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  2
                </div>
                <div className="text-xs text-slate-200 leading-relaxed">
                  مرر للأسفل واختر{' '}
                  <strong className="text-amber-400">
                    &quot;إضافة إلى الشاشة الرئيسية&quot; (Add to Home Screen)
                  </strong>{' '}
                  <span className="inline-flex items-center justify-center p-1 rounded bg-slate-700 text-amber-400 mx-1">
                    <PlusSquare className="w-3.5 h-3.5 inline" />
                  </span>
                  .
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                  3
                </div>
                <div className="text-xs text-slate-200 leading-relaxed">
                  اضغط على <strong className="text-emerald-400">&quot;إضافة&quot; (Add)</strong>، وسيظهر رمز التطبيق مباشرة على شاشة جوالك مع دعم الكاميرا ورفع الفيديوهات!
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>يعمل بدون إنترنت بعد التحميل لحفظ وتوثيق الفعاليات المدرسية</span>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
            >
              فهمت ذلك، شكراً
            </button>
          </div>
        </div>
      )}
    </>
  );
};
