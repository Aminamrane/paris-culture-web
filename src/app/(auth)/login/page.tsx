"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) { setError("Entrez votre nom."); triggerShake(); return; }
    if (!email.trim() || !password) { setError("Remplissez tous les champs."); triggerShake(); return; }
    if (mode === "signup" && password.length < 6) { setError("Mot de passe trop court (6 caractères min)."); triggerShake(); return; }

    setLoading(true);

    if (mode === "signup") {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Erreur lors de la création du compte.");
        triggerShake();
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      triggerShake();
    } else {
      const onboarded = localStorage.getItem("lumina_onboarded");
      router.push(onboarded ? "/" : "/onboarding");
      router.refresh();
    }
  }

  return (
    <div style={{
      minHeight: "100dvh", background: "#0a0e27",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px 32px",
    }}>
      {/* Logo + titre */}
      <div style={{
        textAlign: "center", marginBottom: 40,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(-30px)",
        transition: "opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.34,1.2,0.64,1)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpeg" alt="Lumina" style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 16 }} />
        <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", letterSpacing: -0.5, margin: 0 }}>Lumina</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6, letterSpacing: 2 }}>CULTURE PARISIENNE</p>
      </div>

      <div style={{
        width: "100%", maxWidth: 380,
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(30px)",
        transition: "opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s",
      }}>
        {/* Tab switcher */}
        <div style={{
          display: "flex", background: "rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 4, marginBottom: 28, position: "relative",
        }}>
          {(["login", "signup"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
                borderRadius: 12, fontWeight: 700, fontSize: 15, zIndex: 1, position: "relative",
                background: mode === m ? "#E85D3A" : "transparent",
                color: mode === m ? "#fff" : "rgba(255,255,255,0.4)",
                transition: "all 0.25s",
              }}>
              {m === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ transform: shake ? "translateX(0)" : undefined }}>
          <style>{`
            @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-12px)} 40%{transform:translateX(12px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }
            .shake { animation: shake 0.45s ease-in-out; }
          `}</style>

          <div className={shake ? "shake" : ""}>
            {mode === "signup" && (
              <AuthField icon="👤" placeholder="Nom complet" value={name} onChange={setName} type="text" />
            )}
            <AuthField icon="✉️" placeholder="Adresse email" value={email} onChange={setEmail} type="email" />
            <AuthField icon="🔒" placeholder="Mot de passe" value={password} onChange={setPassword}
              type={showPass ? "text" : "password"}
              rightAction={{ label: showPass ? "👁️‍🗨️" : "👁️", onClick: () => setShowPass(!showPass) }}
            />

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "rgba(255,68,68,0.12)", borderRadius: 12,
                padding: "12px 14px", marginBottom: 16,
                border: "1px solid rgba(255,68,68,0.25)",
              }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span style={{ fontSize: 13, color: "#FF6B6B" }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "18px 0", border: "none", cursor: loading ? "default" : "pointer",
              borderRadius: 16, fontSize: 16, fontWeight: 700, color: "#fff",
              background: "#E85D3A",
              boxShadow: "0 8px 24px rgba(232,93,58,0.4)",
              opacity: loading ? 0.8 : 1,
              transition: "opacity 0.2s, transform 0.1s",
              marginTop: 4,
            }}>
              {loading ? "Chargement..." : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </div>
        </form>

        {/* Séparateur */}
        <div style={{ display: "flex", alignItems: "center", margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: "0 12px" }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Continuer sans compte */}
        <Link href="/" style={{
          display: "block", textAlign: "center", padding: "16px 0",
          borderRadius: 16, fontSize: 15, color: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(255,255,255,0.04)",
          textDecoration: "none", fontWeight: 500,
        }}>
          Continuer sans compte
        </Link>

        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center", marginTop: 24, lineHeight: "16px" }}>
          En continuant, vous acceptez nos conditions d&apos;utilisation.
        </p>
      </div>
    </div>
  );
}

function AuthField({ icon, placeholder, value, onChange, type, rightAction }: {
  icon: string; placeholder: string; value: string;
  onChange: (v: string) => void; type: string;
  rightAction?: { label: string; onClick: () => void };
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center",
      background: focused ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
      borderRadius: 16, padding: "0 16px", height: 56, marginBottom: 14,
      border: `1.5px solid ${focused ? "rgba(232,93,58,0.5)" : "rgba(255,255,255,0.08)"}`,
      transition: "all 0.2s",
    }}>
      <span style={{ fontSize: 16, marginRight: 12, opacity: 0.6 }}>{icon}</span>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: "none", outline: "none", background: "transparent",
          fontSize: 15, color: "#fff", fontFamily: "inherit",
        }}
      />
      {rightAction && (
        <button type="button" onClick={rightAction.onClick}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: 0.5, padding: 4 }}>
          {rightAction.label}
        </button>
      )}
    </div>
  );
}
