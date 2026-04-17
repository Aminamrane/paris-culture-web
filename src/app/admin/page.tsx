"use client";

import Link from "next/link";

const CARDS = [
  {
    href: "/admin/curation",
    emoji: "🃏",
    title: "Curation carte",
    desc: "Swipe gauche/droite pour approuver les événements sur la carte",
    accent: "#2563EB",
    badge: null,
  },
  {
    href: "/admin/users",
    emoji: "👥",
    title: "Utilisateurs",
    desc: "Gérer les comptes, certifier des créateurs",
    accent: "#6366F1",
    badge: null,
  },
  {
    href: "/admin/submissions",
    emoji: "📋",
    title: "Soumissions",
    desc: "Événements en attente de validation",
    accent: "#F59E0B",
    badge: "À traiter",
  },
  {
    href: "/admin/settings",
    emoji: "⚙️",
    title: "Paramètres",
    desc: "Configuration de l'application",
    accent: "#10B981",
    badge: null,
  },
];

const QUICK_LINKS = [
  { href: "/", label: "← App publique" },
  { href: "/api/events", label: "API Events" },
  { href: "/api/feed", label: "API Feed" },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen" style={{ background: "#0f1117" }}>
      {/* Header */}
      <div className="px-6 pt-14 pb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#2563EB" }}>Admin Panel</span>
        </div>
        <h1 className="text-3xl font-black text-white">Lumina</h1>
        <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Gérez votre application culturelle</p>
      </div>

      {/* Cards */}
      <div className="px-4 grid grid-cols-1 gap-3 mb-8">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="relative overflow-hidden rounded-2xl p-5 flex items-start gap-4 active:scale-[0.98] transition-transform"
            style={{ background: "#1a1d27" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              style={{ background: `${card.accent}22` }}
            >
              {card.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-white">{card.title}</span>
                {card.badge && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ background: card.accent, color: "#fff" }}
                  >
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#6b7280" }}>{card.desc}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-1">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="px-4 mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#4b5563" }}>Liens rapides</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "#1a1d27", color: "#9ca3af", border: "1px solid #2a2d37" }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
