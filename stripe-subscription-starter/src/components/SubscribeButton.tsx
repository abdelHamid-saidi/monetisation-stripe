"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function SubscribeButton({
  priceId,
  label,
}: {
  priceId: string;
  label: string;
}) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (status !== "authenticated") {
      window.location.href = "/login?callbackUrl=/";
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json()) as { url?: string; updated?: boolean; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Impossible de démarrer l'abonnement.");
        setLoading(false);
        return;
      }

      if (data.updated) {
        window.location.href = "/dashboard";
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("URL de paiement absente.");
      setLoading(false);
    } catch {
      setError("Erreur réseau.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn w-full" onClick={handleClick} disabled={loading}>
        {loading ? "Redirection..." : label}
      </button>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
