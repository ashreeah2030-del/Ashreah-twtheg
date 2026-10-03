import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-bold mb-2">الصفحة غير موجودة</h2>
      <Link href="/" className="text-blue-400 hover:underline text-sm">
        العودة إلى التطبيق
      </Link>
    </div>
  );
}
