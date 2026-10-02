"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

export default function PayNowButton({
  productId,
  label = "Payer maintenant",
}: {
  productId?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          productId
            ? { purchaseType: "product", productId }
            : { purchaseType: "premium" }
        ),
      });

      if (res.status === 401) {
        const callbackUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?callbackUrl=${callbackUrl}`;
        return;
      }

      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error ?? "Le paiement n'a pas pu démarrer.");
        setLoading(false);
        return;
      }

      const stripe = await stripePromise;
      const result = await stripe?.redirectToCheckout({ sessionId: data.id });
      if (result?.error) {
        setError(result.error.message ?? "Redirection Stripe impossible.");
        setLoading(false);
      }
    } catch {
      setError("Erreur réseau lors de la création de la session.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={handleClick} disabled={loading} className="btn">
        {loading ? "Redirection..." : label}
      </button>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
