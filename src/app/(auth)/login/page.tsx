"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="fixed inset-0 bg-stone-50 flex flex-col items-center justify-center px-6" style={{ paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-1">Connexion</h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          Accédez à vos événements favoris
        </p>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-400 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-primary font-medium">
            S'inscrire
          </Link>
        </p>

        <Link href="/" className="block text-center text-xs text-gray-400 mt-4">
          ← Retour à la carte
        </Link>
      </div>
    </div>
  );
}
