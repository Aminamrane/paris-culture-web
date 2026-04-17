"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Paris Culture
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Carte
          </Link>
          <Link
            href="/events"
            className="hover:text-blue-600 transition-colors"
          >
            Événements
          </Link>
          <Link
            href="/calendar"
            className="hover:text-blue-600 transition-colors"
          >
            Calendrier
          </Link>
          <Link
            href="/search"
            className="hover:text-blue-600 transition-colors"
          >
            Recherche
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="text-sm hover:text-blue-600 transition-colors"
              >
                {session.user.name || session.user.email}
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm hover:text-blue-600 transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
