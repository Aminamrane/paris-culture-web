"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import MobileShell from "@/components/layout/MobileShell";
import Link from "next/link";

interface FeedItem {
  id: string;
  userId: string;
  userName: string | null;
  type: string;
  entityId: string;
  entityType: string;
  entityData: {
    title?: string;
    name?: string;
    coverUrl?: string | null;
    category?: string;
    dateStart?: string | null;
    addressName?: string | null;
  } | null;
  createdAt: string;
}

const LABELS: Record<string, { verb: string; icon: string }> = {
  SAVED_EVENT: { verb: "a sauvegardé", icon: "🔖" },
  SAVED_VENUE: { verb: "a ajouté le lieu", icon: "🏛" },
  FOLLOWED_USER: { verb: "suit maintenant", icon: "👋" },
  REGISTERED_EVENT: { verb: "participe à", icon: "✅" },
  CREATED_EVENT: { verb: "a créé", icon: "✨" },
};

function formatRelative(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d}j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"global" | "following">("global");

  useEffect(() => {
    setLoading(true);
    const url = tab === "following" && session?.user?.id
      ? `/api/feed?followingOf=${session.user.id}&limit=50`
      : `/api/feed?limit=50`;

    fetch(url)
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, session?.user?.id]);

  return (
    <MobileShell>
      <div className="pb-4">
        <div className="px-4 pt-3 pb-3">
          <h1 className="text-xl font-bold text-gray-900">Fil d'actualité</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 mb-4">
          {[
            { key: "global" as const, label: "Tendances" },
            { key: "following" as const, label: "Abonnements" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-full text-sm font-medium transition-all"
              style={tab === t.key ? { background: "#1f2937", color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-4xl mb-3">{tab === "following" ? "👥" : "📰"}</div>
            <p className="text-sm font-semibold text-gray-700">
              {tab === "following" ? "Aucune activité de vos abonnements" : "Fil vide"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {tab === "following"
                ? "Suivez des utilisateurs pour voir leur activité ici"
                : "L'activité de la communauté apparaîtra ici"}
            </p>
            {tab === "following" && !session?.user && (
              <Link href="/login" className="inline-block mt-4 px-5 py-2 rounded-full text-xs font-semibold text-white" style={{ background: "#2563EB" }}>
                Se connecter
              </Link>
            )}
          </div>
        ) : (
          <div className="px-4 space-y-3">
            {items.map(item => {
              const label = LABELS[item.type] || { verb: item.type, icon: "•" };
              const entity = item.entityData;
              const name = entity?.title || entity?.name;

              return (
                <div key={item.id} className="bg-white rounded-2xl p-3 shadow-sm" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: "linear-gradient(135deg,#2563EB,#60A5FA)" }}
                    >
                      {initials(item.userName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-semibold">{item.userName || "Utilisateur"}</span>
                        {" "}
                        <span className="text-gray-500">{label.verb}</span>
                        {name && (
                          <> {" "}<span className="font-semibold text-gray-800">{name}</span></>
                        )}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatRelative(item.createdAt)}</p>
                    </div>

                    {/* Event cover thumbnail */}
                    {entity?.coverUrl && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={entity.coverUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {!entity?.coverUrl && (
                      <span className="text-xl shrink-0">{label.icon}</span>
                    )}
                  </div>

                  {/* Event detail pill */}
                  {entity?.addressName && (
                    <div className="mt-2 ml-12 flex items-center gap-1.5 text-[11px] text-gray-400">
                      <span>📍</span>
                      <span className="truncate">{entity.addressName}</span>
                      {entity.dateStart && (
                        <>
                          <span>·</span>
                          <span>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(entity.dateStart))}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
