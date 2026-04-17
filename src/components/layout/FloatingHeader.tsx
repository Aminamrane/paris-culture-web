"use client";

import Link from "next/link";

export default function FloatingHeader() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
      style={{ paddingTop: "calc(12px + var(--safe-top))" }}
    >
      {/* Profile button */}
      <Link
        href="/profile"
        className="relative w-11 h-11 bg-white/90 backdrop-blur-xl rounded-full shadow-md shadow-black/10 flex items-center justify-center active:scale-95 transition-transform"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#2563EB] rounded-full border-2 border-white" />
      </Link>

      {/* Filter button */}
      <button className="w-11 h-11 bg-white/90 backdrop-blur-xl rounded-full shadow-md shadow-black/10 flex items-center justify-center active:scale-95 transition-transform">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="8" cy="6" r="2" fill="white" stroke="#374151" />
          <circle cx="16" cy="12" r="2" fill="white" stroke="#374151" />
          <circle cx="10" cy="18" r="2" fill="white" stroke="#374151" />
        </svg>
      </button>

      {/* City selector */}
      <button className="h-11 px-4 bg-white/90 backdrop-blur-xl rounded-full shadow-md shadow-black/10 flex items-center gap-1.5 active:scale-95 transition-transform">
        <span className="text-sm font-semibold text-gray-800">Paris</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
}
