"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SubscribeButton from "@/components/SubscribeButton";
import { getPlanByPriceId, plans } from "@/lib/stripe/plans";

const statusLabels: Record<string, string> = {
  none: "Aucun",
  active: "Actif",
  trialing: "Essai",
  past_due: "Paiement en retard",
  canceled: "Annulé",
  incomplete: "Incomplet",
  incomplete_expired: "Expiré",
  unpaid: "Impayé",
  paused: "En pause",
};

type StatusResponse = {
  status?: string;
  subscriptionId?: string | null;
  currentPeriodEnd?: string | null;
  error?: string;
};

export default function DashboardPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [subscriptionStatus, setSubscriptionStatus] = useState("none");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/stripe/get-subscription-status")
      .then((res) => res.json())
      .then((data: StatusResponse) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setSubscriptionStatus(data.status ?? "none");
        setSubscriptionId(data.subscriptionId ?? null);
        setCurrentPeriodEnd(data.currentPeriodEnd ?? null);
      })
      .catch(() => setError("Impossible de lire le statut Stripe."));
  }, [status, session?.user?.stripePriceId]);

  const userPlan = plans.find((plan) => plan.priceId === session?.user?.stripePriceId);
  const currentPlan = userPlan ?? getPlanByPriceId(session?.user?.stripePriceId);
  const upgrades = currentPlan
    ? plans.filter((plan) => plan.level > currentPlan.level && plan.priceId)
    : [];

  const handleCancel = async (id: string) => {
    setCanceling(true);
    setError(null);
    const res = await fetch("/api/stripe/cancel-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: id }),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      setError(data.error ?? "Annulation impossible.");
      setCanceling(false);
      return;
    }
    await update();
    router.refresh();
    setSubscriptionStatus("canceled");
    setCanceling(false);
  };

  if (status !== "authenticated") {
    return <main className="card">Chargement de la session...</main>;
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="card">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3730a3]">
          Espace abonné
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Tableau de bord</h1>
        {currentPlan ? (
          <div className="mt-6 space-y-2">
            <p>Plan: {currentPlan.name}</p>
            <p>Prix: {currentPlan.price}€/mois</p>
            <p>Statut: {statusLabels[subscriptionStatus] ?? subscriptionStatus}</p>
            {currentPeriodEnd ? (
              <p>
                Fin de période:{" "}
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(currentPeriodEnd))}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-6">Aucun plan actif.</p>
        )}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        {subscriptionId && subscriptionStatus !== "none" && subscriptionStatus !== "canceled" ? (
          <button
            type="button"
            className="btn mt-6"
            disabled={canceling}
            onClick={() => handleCancel(subscriptionId)}
          >
            {canceling ? "Annulation..." : "Annuler l'abonnement"}
          </button>
        ) : null}
      </section>

      <section className="card">
        <h2 className="font-display text-2xl">Mettre à niveau</h2>
        <p className="mt-2 text-sm text-[#1c1830]/70">
          Le guide autorise uniquement la montée de niveau. Le passage par{" "}
          <code>subscriptions.update</code> n&apos;y est pas montré : il évite un second abonnement.
        </p>
        <div className="mt-4 space-y-3">
          {upgrades.length === 0 ? (
            <p className="text-sm">Aucun plan supérieur disponible.</p>
          ) : (
            upgrades.map((plan) => (
              <SubscribeButton key={plan.name} priceId={plan.priceId} label={`${plan.name} · ${plan.price} €`} />
            ))
          )}
        </div>
      </section>
    </main>
  );
}
