"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function SuccessPage() {
  const { update, status } = useSession();
  const refreshed = useRef(false);

  useEffect(() => {
    if (status === "authenticated" && !refreshed.current) {
      refreshed.current = true;
      void update();
    }
  }, [status, update]);

  return (
    <main className="card mx-auto max-w-xl text-center">
      <h1 className="font-display text-4xl font-semibold">Abonnement envoyé</h1>
      <p className="mt-4 text-[#1c1830]/75">
        Le plan n&apos;est enregistré qu&apos;après le webhook{" "}
        <code>checkout.session.completed</code>. Ouvrez le tableau de bord une fois Stripe CLI
        à l&apos;écoute.
      </p>
      <Link href="/dashboard" className="btn mt-6">
        Voir mon abonnement
      </Link>
    </main>
  );
}
