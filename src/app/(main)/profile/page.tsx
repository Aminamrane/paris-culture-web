"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import MobileShell from "@/components/layout/MobileShell";
import Link from "next/link";

interface SavedEventData {
  externalId: string; title: string; coverUrl: string | null;
  dateStart: string | null; addressName: string | null;
  category: string; priceType: string | null; savedAt: string;
}

function getLocalSaved(): SavedEventData[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("lumina_saved_events") || "[]"); } catch { return []; }
}
function formatRelative(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h}h`;
  return `il y a ${Math.floor(h / 24)}j`;
}
function formatDate(d: string | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(d));
}

function QRCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!canvasRef.current || !url) return;
    import("qrcode").then((QRCode) => {
      QRCode.toCanvas(canvasRef.current!, url, { width: 220, margin: 2, color: { dark: "#1f2937", light: "#ffffff" } });
    }).catch(() => setError(true));
  }, [url]);
  if (error) return <div className="w-[220px] h-[220px] bg-gray-100 rounded-2xl flex items-center justify-center text-sm text-gray-400">QR Code indisponible</div>;
  return <canvas ref={canvasRef} style={{ borderRadius: 16, display: "block" }} />;
}

function SavedCard({ event, onUnsave }: { event: SavedEventData; onUnsave: () => void }) {
  return (
    <div className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm active:scale-[0.98] transition-transform">
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
        {event.coverUrl ? <img src={event.coverUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-xl">🎭</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-[#E85D3A] mb-0.5 capitalize">{event.category}</p>
        <h3 className="text-sm font-semibold leading-tight line-clamp-2">{event.title}</h3>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400">
          {event.dateStart && <span>{formatDate(event.dateStart)}</span>}
          {event.addressName && <span className="truncate">📍 {event.addressName}</span>}
        </div>
      </div>
      <button onClick={onUnsave} className="shrink-0 w-8 h-8 flex items-center justify-center text-[#E85D3A] active:scale-90 transition-all" style={{ alignSelf: "center" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"saved" | "venues" | "journal" | "share">("saved");
  const [savedEvents, setSavedEvents] = useState<SavedEventData[]>([]);
  const [copied, setCopied] = useState(false);

  const user = session?.user;
  const initials = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "?";

  useEffect(() => { setSavedEvents(getLocalSaved()); }, []);

  const unsaveEvent = (externalId: string) => {
    const updated = savedEvents.filter((e) => e.externalId !== externalId);
    localStorage.setItem("lumina_saved_events", JSON.stringify(updated));
    setSavedEvents(updated);
  };

  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/profile/${user?.id || "me"}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(profileUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  };

  if (status === "loading") {
    return <MobileShell><div className="flex items-center justify-center py-24"><div className="w-6 h-6 border-2 border-[#E85D3A] border-t-transparent rounded-full animate-spin" /></div></MobileShell>;
  }

  if (!user) {
    return (
      <MobileShell>
        <div className="px-4 pt-8 pb-4 flex flex-col items-center text-center gap-5">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-xl" style={{ background: "linear-gradient(135deg,#E85D3A,#f07a5a)" }}>?</div>
          <div><h1 className="text-xl font-bold">Mon profil</h1><p className="text-sm text-gray-400 mt-1">Connectez-vous pour accéder à votre profil</p></div>
          {savedEvents.length > 0 && (
            <div className="w-full rounded-2xl p-3 text-left" style={{ background: "rgba(232,93,58,0.06)", border: "1px solid rgba(232,93,58,0.15)" }}>
              <p className="text-xs font-semibold text-[#E85D3A] mb-0.5">{savedEvents.length} événement{savedEvents.length > 1 ? "s" : ""} sauvegardé{savedEvents.length > 1 ? "s" : ""}</p>
              <p className="text-xs text-gray-500">Connectez-vous pour les retrouver sur tous vos appareils</p>
            </div>
          )}
          <div className="w-full space-y-2.5">
            <Link href="/login" className="block w-full text-center py-3.5 rounded-2xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg,#E85D3A,#f07a5a)", boxShadow: "0 4px 14px rgba(232,93,58,0.35)" }}>Se connecter</Link>
            <Link href="/register" className="block w-full bg-white text-center py-3.5 rounded-2xl text-sm font-medium text-gray-700" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>Créer un compte</Link>
          </div>
        </div>
      </MobileShell>
    );
  }

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const isCertified = (session?.user as { certified?: boolean })?.certified;

  return (
    <MobileShell>
      <div className="pb-4">
        <div className="px-4 pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0 shadow-lg" style={{ background: "linear-gradient(135deg,#E85D3A,#f07a5a)" }}>{initials}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold truncate">{user.name || "Utilisateur"}</h1>
                {isCertified && <span title="Certifié Lumina" style={{ color: "#E85D3A" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></span>}
                {isAdmin && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "#1f2937" }}>ADMIN</span>}
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
              <div className="flex gap-3 mt-1.5"><span className="text-xs text-gray-500"><span className="font-bold text-gray-800">{savedEvents.length}</span> sauvegardés</span></div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 active:scale-90 transition-all shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            </button>
          </div>
          {isAdmin && (
            <Link href="/admin" className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg,#1f2937,#374151)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              Panel Administration
            </Link>
          )}
        </div>

        <div className="flex gap-1.5 px-4 mb-4 overflow-x-auto no-scrollbar">
          {([
            { key: "saved", label: "Sauvegardés", count: savedEvents.length },
            { key: "venues", label: "Lieux" },
            { key: "journal", label: "Journal" },
            { key: "share", label: "Partager" },
          ] as const).map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className="shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all"
              style={activeTab === tab.key ? { background: "#1f2937", color: "#fff" } : { background: "#f3f4f6", color: "#6b7280" }}>
              {tab.label}
              {"count" in tab && tab.count > 0 && (
                <span className="rounded-full px-1 min-w-[16px] text-center text-[10px] font-bold" style={activeTab === tab.key ? { background: "rgba(255,255,255,0.2)", color: "#fff" } : { background: "#E85D3A", color: "#fff" }}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "saved" && (
          <div className="px-4 space-y-2.5">
            {savedEvents.length === 0 ? (
              <div className="text-center py-14">
                <div className="text-4xl mb-3">🔖</div>
                <p className="text-sm font-semibold text-gray-700">Aucun événement sauvegardé</p>
                <p className="text-xs text-gray-400 mt-1">Appuyez sur le cœur dans un événement pour le sauvegarder</p>
                <Link href="/" className="inline-block mt-4 px-5 py-2 rounded-full text-xs font-semibold text-white" style={{ background: "#E85D3A" }}>Explorer la carte</Link>
              </div>
            ) : savedEvents.map((ev) => <SavedCard key={ev.externalId} event={ev} onUnsave={() => unsaveEvent(ev.externalId)} />)}
          </div>
        )}

        {activeTab === "venues" && (
          <div className="px-4 text-center py-14"><div className="text-4xl mb-3">🏛</div><p className="text-sm font-semibold text-gray-700">Aucun lieu sauvegardé</p><p className="text-xs text-gray-400 mt-1">Sauvegardez vos lieux culturels favoris depuis la carte</p></div>
        )}

        {activeTab === "journal" && (
          <div className="px-4">
            {savedEvents.length === 0 ? (
              <div className="text-center py-14"><div className="text-4xl mb-3">📖</div><p className="text-sm font-semibold text-gray-700">Journal vide</p><p className="text-xs text-gray-400 mt-1">Votre activité apparaîtra ici</p></div>
            ) : (
              <div className="space-y-2.5">
                {savedEvents.map((ev) => (
                  <div key={ev.externalId} className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">{ev.coverUrl ? <img src={ev.coverUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🎭</div>}</div>
                    <div className="flex-1 min-w-0"><p className="text-[11px] text-gray-400">Vous avez sauvegardé</p><p className="text-sm font-semibold truncate">{ev.title}</p></div>
                    <span className="text-[10px] text-gray-300 shrink-0">{formatRelative(ev.savedAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "share" && (
          <div className="px-4 flex flex-col items-center gap-5 pt-2">
            <div className="p-5 bg-white rounded-3xl" style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}><QRCanvas url={profileUrl} /></div>
            <div className="text-center"><p className="text-sm font-semibold text-gray-800">{user.name}</p><p className="text-xs text-gray-400 mt-0.5">Scannez pour voir mon profil Lumina</p></div>
            <button onClick={copyLink} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-semibold text-white w-full justify-center transition-all active:scale-[0.98]"
              style={{ background: copied ? "#22c55e" : "linear-gradient(135deg,#E85D3A,#f07a5a)", boxShadow: "0 4px 14px rgba(232,93,58,0.3)" }}>
              {copied ? <>✓ Lien copié !</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg> Copier le lien</>}
            </button>
            {typeof navigator !== "undefined" && "share" in navigator && (
              <button onClick={() => navigator.share({ title: `${user.name} sur Lumina`, url: profileUrl })} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-medium text-gray-700 w-full justify-center bg-white active:scale-[0.98]" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                Partager via…
              </button>
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}
