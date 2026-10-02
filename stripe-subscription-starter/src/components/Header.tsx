"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-6">
      <Link href="/" className="font-display text-2xl font-semibold tracking-tight">
        Abonnements
      </Link>
      <nav className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/dashboard" className="px-2 py-1 hover:underline">
          Tableau de bord
        </Link>
        {status === "authenticated" ? (
          <>
            <span className="max-w-[14rem] truncate text-[#1c1830]/70">{session.user?.email}</span>
            <button type="button" className="btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn-ghost">
              Connexion
            </Link>
            <Link href="/register" className="btn">
              Inscription
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
