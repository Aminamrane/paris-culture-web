"use client";

import { usePathname, useRouter } from "next/navigation";

const TABS = [
  {
    key: "map",
    path: "/",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#E85D3A" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z" />
        <path d="M8 2v16" /><path d="M16 6v16" />
      </svg>
    ),
    label: "Carte",
  },
  {
    key: "list",
    path: "/events",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#E85D3A" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    label: "Événements",
  },
  {
    key: "add",
    path: "/submit-event",
    icon: (_active: boolean) => (
      <div
        style={{
          width: 44, height: 44, borderRadius: 14,
          background: "linear-gradient(135deg,#E85D3A,#f07a5a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 14px rgba(232,93,58,0.4)",
          marginTop: -10,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
    ),
    label: "",
  },
  {
    key: "feed",
    path: "/feed",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#E85D3A" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    label: "Fil",
  },
  {
    key: "profile",
    path: "/profile",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#E85D3A" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "Profil",
  },
];

export default function BottomTabs() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: "var(--safe-bottom)" }}>
      <div
        className="flex items-center justify-around mx-4 mb-2 h-16 px-2"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderRadius: 22,
          boxShadow: "0 -1px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.12)",
        }}
      >
        {TABS.map((tab) => {
          const isActive = tab.path === "/" ? pathname === "/" : pathname.startsWith(tab.path);
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90"
              style={{ minWidth: 52, paddingTop: tab.key === "add" ? 0 : 6 }}
            >
              <div
                style={
                  isActive && tab.key !== "add"
                    ? { background: "rgba(232,93,58,0.1)", borderRadius: 10, padding: "4px 10px" }
                    : { padding: "4px 10px" }
                }
              >
                {tab.icon(isActive)}
              </div>
              {tab.label && (
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? "#E85D3A" : "#9CA3AF", letterSpacing: "-0.2px" }}>
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
