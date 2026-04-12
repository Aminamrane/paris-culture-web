"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [barWidth, setBarWidth] = useState(0);
  const [phase, setPhase] = useState<"in" | "loading" | "out">("in");

  useEffect(() => {
    // Phase 1: fade in logo (600ms)
    const t1 = setTimeout(() => setPhase("loading"), 600);
    // Phase 2: animate bar (1800ms)
    const t2 = setTimeout(() => setBarWidth(100), 700);
    // Phase 3: fade out
    const t3 = setTimeout(() => setPhase("out"), 2700);
    // Phase 4: done
    const t4 = setTimeout(() => onDone(), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#0a0e27",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        opacity: phase === "out" ? 0 : 1,
        transition: phase === "out" ? "opacity 0.4s cubic-bezier(0.55,0,1,0.45)" : phase === "in" ? "opacity 0.6s ease-out" : "none",
      }}
    >
      {/* Logo */}
      <div style={{
        opacity: phase === "in" ? 0 : 1,
        transform: phase === "in" ? "scale(0.3)" : "scale(1)",
        transition: "opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpeg" alt="Lumina" style={{ width: 180, height: 180, borderRadius: 30, display: "block" }} />
      </div>

      {/* Tagline */}
      <p style={{
        fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 24,
        letterSpacing: 3, fontWeight: 600, textTransform: "uppercase",
        opacity: phase === "in" ? 0 : 1,
        transform: phase === "in" ? "translateY(20px)" : "translateY(0)",
        transition: "opacity 0.5s ease-out 0.2s, transform 0.5s ease-out 0.2s",
      }}>
        Decouvrez la culture parisienne
      </p>

      {/* Loading bar */}
      <div style={{
        marginTop: 40, height: 3, width: 200,
        background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden",
        opacity: phase === "loading" || phase === "out" ? 1 : 0,
        transition: "opacity 0.3s",
      }}>
        <div style={{
          height: "100%", borderRadius: 2, background: "#E85D3A",
          width: `${barWidth}%`,
          transition: "width 1.8s cubic-bezier(0.25,0.1,0.25,1)",
        }} />
      </div>
    </div>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("lumina_splash_seen");
    if (!seen) setShowSplash(true);
  }, []);

  function handleSplashDone() {
    sessionStorage.setItem("lumina_splash_seen", "1");
    setShowSplash(false);
  }

  return (
    <SessionProvider>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {children}
    </SessionProvider>
  );
}
