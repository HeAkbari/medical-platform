'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm text-slate-600">
      Loading map...
    </div>
  ),
});

export function HomePage() {
  return (
    <div className="fixed inset-0 z-0 h-dvh w-full">
      <Map />

      <div
        className="absolute inset-x-0 bottom-6 z-[1000] flex justify-center px-4 sm:bottom-8"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <Link
          href="/dashboard"
          className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-5 py-2.5 text-sm font-medium text-slate-800 shadow-lg backdrop-blur-md active:scale-95"
        >
          Open clinic
        </Link>
      </div>
    </div>
  );
}
