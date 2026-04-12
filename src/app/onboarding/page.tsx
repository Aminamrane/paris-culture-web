"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = [
  {
    title: "Qu'est-ce qui\nvous passionne ?",
    subtitle: "Sélectionnez vos centres d'intérêt",
    multi: true,
    options: [
      { key: "expo",        label: "Expositions & Arts visuels",  icon: "🖼️" },
      { key: "theatre",     label: "Théâtre",                     icon: "🎭" },
      { key: "musique",     label: "Musiques & concerts",         icon: "🎵" },
      { key: "debats",      label: "Débats & conférences",        icon: "🎤" },
      { key: "street",      label: "Street art",                  icon: "🎨" },
      { key: "litterature", label: "Littérature & rencontres",    icon: "📚" },
      { key: "immersif",    label: "Expériences immersives",      icon: "🥽" },
    ],
  },
  {
    title: "Quel type\nd'expérience ?",
    subtitle: "Dites-nous ce que vous recherchez",
    multi: true,
    options: [
      { key: "solo",       label: "En solo",       icon: "🧍" },
      { key: "amis",       label: "Entre amis",    icon: "👯" },
      { key: "famille",    label: "En famille",    icon: "❤️" },
      { key: "romantique", label: "Romantique",    icon: "🌹" },
      { key: "pleinair",   label: "En plein air",  icon: "☀️" },
      { key: "nocturne",   label: "Nocturne",      icon: "🌙" },
    ],
  },
  {
    title: "À quelle fréquence\nsortez-vous ?",
    subtitle: "Pour mieux personnaliser vos recommandations",
    multi: false,
    options: [
      { key: "daily",      label: "Presque tous les jours",        icon: "🔥" },
      { key: "weekly",     label: "Plusieurs fois par semaine",    icon: "📈" },
      { key: "weekend",    label: "Le week-end",                   icon: "📅" },
      { key: "occasional", label: "Occasionnellement",             icon: "⏱️" },
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<Record<number, string[]>>({});
  const [animDir, setAnimDir] = useState<"in" | "out-left">("in");
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const current = STEPS[step];
  const currentSel = selections[step] || [];
  const canContinue = currentSel.length > 0;
  const isLast = step === STEPS.length - 1;

  function toggle(key: string) {
    const sel = currentSel.slice();
    if (current.multi) {
      const idx = sel.indexOf(key);
      if (idx >= 0) sel.splice(idx, 1); else sel.push(key);
    } else {
      sel.splice(0, sel.length, key);
    }
    setSelections({ ...selections, [step]: sel });
  }

  function goNext() {
    setVisible(false);
    setAnimDir("out-left");
    setTimeout(() => {
      if (isLast) {
        finish();
      } else {
        setStep(step + 1);
        setAnimDir("in");
        setVisible(true);
      }
    }, 220);
  }

  function finish() {
    const cats = selections[0] || [];
    localStorage.setItem("lumina_preferred_cats", JSON.stringify(cats));
    localStorage.setItem("lumina_onboarded", "1");
    router.push("/");
  }

  return (
    <div style={{ height: "100dvh", background: "#0a0e27", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Progress dots */}
      <div style={{ padding: "24px 24px 16px", display: "flex", justifyContent: "center", gap: 8 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            height: 8, borderRadius: 4,
            width: i === step ? 24 : 8,
            background: i === step ? "#E85D3A" : i < step ? "rgba(232,93,58,0.5)" : "rgba(255,255,255,0.15)",
            transition: "all 0.3s",
          }} />
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, padding: "8px 24px 24px", overflowY: "auto",
        opacity: mounted && visible ? 1 : 0,
        transform: mounted && visible ? "translateX(0)" : animDir === "out-left" ? "translateX(-40px)" : "translateX(40px)",
        transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
      }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: "36px",
          marginBottom: 6, whiteSpace: "pre-line",
        }}>{current.title}</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>{current.subtitle}</p>

        {current.options.map((opt, idx) => {
          const selected = currentSel.includes(opt.key);
          return (
            <button key={opt.key} onClick={() => toggle(opt.key)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                padding: "16px 18px", borderRadius: 16, marginBottom: 12,
                cursor: "pointer", textAlign: "left",
                background: selected ? "rgba(232,93,58,0.15)" : "rgba(255,255,255,0.06)",
                border: `1.5px solid ${selected ? "#E85D3A" : "rgba(255,255,255,0.08)"}`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "scale(1)" : "scale(0.85)",
                transition: `opacity 0.3s ease-out ${idx * 50}ms, transform 0.3s ease-out ${idx * 50}ms, background 0.2s, border-color 0.2s`,
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12, marginRight: 14,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                background: selected ? "rgba(232,93,58,0.2)" : "rgba(255,255,255,0.06)",
                flexShrink: 0,
              }}>{opt.icon}</div>
              <span style={{ fontSize: 15, fontWeight: 600, color: selected ? "#fff" : "rgba(255,255,255,0.6)", flex: 1 }}>
                {opt.label}
              </span>
              <div style={{
                width: 24, height: 24, borderRadius: 12, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: selected ? "#E85D3A" : "transparent",
                border: selected ? "none" : "1.5px solid rgba(255,255,255,0.15)",
                transition: "all 0.2s",
              }}>
                {selected && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom buttons */}
      <div style={{
        padding: "12px 24px 40px",
        background: "#0a0e27",
        display: "flex", alignItems: "center", gap: 16,
      }}>
        <button onClick={finish} style={{
          flex: 1, background: "none", border: "none", cursor: "pointer",
          fontSize: 15, color: "rgba(255,255,255,0.4)", fontWeight: 500, textAlign: "left",
        }}>
          Passer
        </button>
        <button onClick={canContinue ? goNext : undefined}
          style={{
            padding: "16px 32px", borderRadius: 16, border: "none",
            cursor: canContinue ? "pointer" : "default",
            fontSize: 16, fontWeight: 700, color: canContinue ? "#fff" : "rgba(255,255,255,0.25)",
            background: canContinue ? "#E85D3A" : "rgba(255,255,255,0.08)",
            boxShadow: canContinue ? "0 6px 20px rgba(232,93,58,0.4)" : "none",
            transition: "all 0.2s",
          }}>
          {isLast ? "C'est parti !" : "Continuer"}
        </button>
      </div>
    </div>
  );
}
