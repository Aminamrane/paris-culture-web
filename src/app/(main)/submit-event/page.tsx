"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import MobileShell from "@/components/layout/MobileShell";
import Link from "next/link";

const CATEGORIES = [
  { key: "expo", label: "Exposition", emoji: "🎨" },
  { key: "theatre", label: "Théâtre", emoji: "🎭" },
  { key: "musique", label: "Musique", emoji: "🎵" },
  { key: "debats", label: "Conférence / Débat", emoji: "💬" },
  { key: "cinema", label: "Cinéma", emoji: "🎬" },
  { key: "litterature", label: "Littérature", emoji: "📚" },
  { key: "immersif", label: "Art numérique", emoji: "✨" },
  { key: "street", label: "Street Art", emoji: "🎪" },
  { key: "famille", label: "Famille", emoji: "👨‍👩‍👧" },
  { key: "autre", label: "Autre", emoji: "🎯" },
];

interface FormState {
  title: string;
  category: string;
  dateStart: string;
  dateEnd: string;
  addressName: string;
  addressStreet: string;
  description: string;
  priceType: "gratuit" | "payant" | "";
  priceDetail: string;
  contactUrl: string;
  accessLink: string;
}

const EMPTY: FormState = {
  title: "", category: "", dateStart: "", dateEnd: "",
  addressName: "", addressStreet: "", description: "",
  priceType: "", priceDetail: "", contactUrl: "", accessLink: "",
};

export default function SubmitEventPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormState, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/events/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Erreur"); }
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const isCertified = (session?.user as { certified?: boolean })?.certified;

  if (!session?.user) {
    return (
      <MobileShell>
        <div className="px-4 pt-8 text-center flex flex-col items-center gap-5">
          <div className="text-5xl">📋</div>
          <div>
            <h1 className="text-xl font-bold">Proposer un événement</h1>
            <p className="text-sm text-gray-400 mt-1">Connectez-vous pour soumettre un événement</p>
          </div>
          <Link href="/login?redirect=/submit-event" className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white text-center block" style={{ background: "linear-gradient(135deg,#E85D3A,#f07a5a)" }}>
            Se connecter
          </Link>
        </div>
      </MobileShell>
    );
  }

  if (success) {
    return (
      <MobileShell>
        <div className="px-4 pt-12 text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ background: isCertified ? "rgba(34,197,94,0.1)" : "rgba(232,93,58,0.1)" }}>
            {isCertified ? "✅" : "⏳"}
          </div>
          <div>
            <h1 className="text-xl font-bold">{isCertified ? "Événement publié !" : "Soumission envoyée !"}</h1>
            <p className="text-sm text-gray-500 mt-2">
              {isCertified
                ? "Votre événement est immédiatement visible sur la carte."
                : "Votre événement sera examiné par l'équipe Lumina avant publication."}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 w-full">
            <Link href="/events" className="py-3.5 rounded-2xl text-sm font-semibold text-white text-center block" style={{ background: "linear-gradient(135deg,#E85D3A,#f07a5a)" }}>
              Voir les événements
            </Link>
            <button onClick={() => { setForm(EMPTY); setStep(1); setSuccess(false); }} className="py-3.5 rounded-2xl text-sm font-medium text-gray-700 bg-white" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
              Soumettre un autre événement
            </button>
          </div>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="pb-6">
        {/* Header */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold">Proposer un événement</h1>
            {!isCertified && (
              <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                Nécessite validation
              </span>
            )}
          </div>
          {isCertified && (
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Compte certifié — publication instantanée
            </p>
          )}

          {/* Progress */}
          <div className="flex gap-1.5 mt-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="flex-1 h-1 rounded-full transition-all" style={{ background: step >= n ? "#E85D3A" : "#e5e7eb" }} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">Étape {step} sur 3</p>
        </div>

        {/* Step 1: Infos principales */}
        {step === 1 && (
          <div className="px-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Titre de l'événement *</label>
              <input
                value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="Ex: Exposition Picasso au Grand Palais"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all"
                style={{ background: "#f9fafb", border: "1.5px solid #f3f4f6", fontFamily: "inherit" }}
                onFocus={e => (e.target.style.borderColor = "#E85D3A")}
                onBlur={e => (e.target.style.borderColor = "#f3f4f6")}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Catégorie *</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => set("category", cat.key)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                    style={form.category === cat.key
                      ? { background: "rgba(232,93,58,0.1)", border: "1.5px solid #E85D3A", color: "#E85D3A" }
                      : { background: "#f9fafb", border: "1.5px solid #f3f4f6", color: "#374151" }
                    }
                  >
                    <span>{cat.emoji}</span>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Décrivez votre événement..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none transition-all"
                style={{ background: "#f9fafb", border: "1.5px solid #f3f4f6", fontFamily: "inherit" }}
                onFocus={e => (e.target.style.borderColor = "#E85D3A")}
                onBlur={e => (e.target.style.borderColor = "#f3f4f6")}
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.title || !form.category}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all"
              style={{ background: form.title && form.category ? "linear-gradient(135deg,#E85D3A,#f07a5a)" : "#e5e7eb", color: form.title && form.category ? "#fff" : "#9ca3af" }}
            >
              Continuer
            </button>
          </div>
        )}

        {/* Step 2: Date & Lieu */}
        {step === 2 && (
          <div className="px-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date de début *</label>
                <input type="date" value={form.dateStart} onChange={e => set("dateStart", e.target.value)} className="w-full px-3 py-3 rounded-2xl text-sm outline-none" style={{ background: "#f9fafb", border: "1.5px solid #f3f4f6", fontFamily: "inherit" }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Date de fin</label>
                <input type="date" value={form.dateEnd} onChange={e => set("dateEnd", e.target.value)} className="w-full px-3 py-3 rounded-2xl text-sm outline-none" style={{ background: "#f9fafb", border: "1.5px solid #f3f4f6", fontFamily: "inherit" }} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Nom du lieu *</label>
              <input value={form.addressName} onChange={e => set("addressName", e.target.value)} placeholder="Ex: Centre Pompidou" className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: "#f9fafb", border: "1.5px solid #f3f4f6", fontFamily: "inherit" }} />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Adresse</label>
              <input value={form.addressStreet} onChange={e => set("addressStreet", e.target.value)} placeholder="Ex: Place Georges Pompidou, 75004" className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: "#f9fafb", border: "1.5px solid #f3f4f6", fontFamily: "inherit" }} />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">Tarif</label>
              <div className="flex gap-2">
                {[{ key: "gratuit", label: "Gratuit" }, { key: "payant", label: "Payant" }].map(p => (
                  <button key={p.key} onClick={() => set("priceType", p.key as "gratuit" | "payant")} className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={form.priceType === p.key ? { background: "rgba(232,93,58,0.1)", border: "1.5px solid #E85D3A", color: "#E85D3A" } : { background: "#f9fafb", border: "1.5px solid #f3f4f6", color: "#374151" }}>
                    {p.label}
                  </button>
                ))}
              </div>
              {form.priceType === "payant" && (
                <input value={form.priceDetail} onChange={e => set("priceDetail", e.target.value)} placeholder="Ex: 12€ / 8€ réduit" className="w-full mt-2 px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: "#f9fafb", border: "1.5px solid #f3f4f6", fontFamily: "inherit" }} />
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-gray-600 bg-white" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                Retour
              </button>
              <button onClick={() => setStep(3)} disabled={!form.dateStart || !form.addressName} className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white"
                style={{ background: form.dateStart && form.addressName ? "linear-gradient(135deg,#E85D3A,#f07a5a)" : "#e5e7eb", color: form.dateStart && form.addressName ? "#fff" : "#9ca3af" }}>
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Liens & confirmation */}
        {step === 3 && (
          <div className="px-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Site web / billetterie</label>
              <input value={form.accessLink} onChange={e => set("accessLink", e.target.value)} placeholder="https://…" className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: "#f9fafb", border: "1.5px solid #f3f4f6", fontFamily: "inherit" }} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Lien de contact / plus d'infos</label>
              <input value={form.contactUrl} onChange={e => set("contactUrl", e.target.value)} placeholder="https://…" className="w-full px-4 py-3 rounded-2xl text-sm outline-none" style={{ background: "#f9fafb", border: "1.5px solid #f3f4f6", fontFamily: "inherit" }} />
            </div>

            {/* Summary */}
            <div className="rounded-2xl p-4 space-y-2" style={{ background: "#f9fafb" }}>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Récapitulatif</h3>
              {[
                { label: "Titre", value: form.title },
                { label: "Catégorie", value: CATEGORIES.find(c => c.key === form.category)?.label },
                { label: "Date", value: form.dateStart },
                { label: "Lieu", value: form.addressName },
                { label: "Tarif", value: form.priceType === "gratuit" ? "Gratuit" : form.priceDetail || "Payant" },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="flex gap-2 text-sm">
                  <span className="text-gray-400 shrink-0 w-20">{row.label}</span>
                  <span className="font-medium text-gray-800 truncate">{row.value}</span>
                </div>
              ))}
            </div>

            {!isCertified && (
              <div className="rounded-2xl p-3 text-sm text-amber-700 flex gap-2 items-start" style={{ background: "rgba(251,191,36,0.1)" }}>
                <span className="text-base shrink-0">⏳</span>
                <p className="text-xs">Votre événement sera examiné par l'équipe Lumina avant d'être publié sur la carte.</p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl p-3 text-sm text-red-600 bg-red-50">{error}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-2xl text-sm font-medium text-gray-600 bg-white" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                Retour
              </button>
              <button
                onClick={submit}
                disabled={loading}
                className="flex-1 py-3.5 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#E85D3A,#f07a5a)", boxShadow: "0 4px 14px rgba(232,93,58,0.3)" }}
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : "Soumettre"}
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
}
