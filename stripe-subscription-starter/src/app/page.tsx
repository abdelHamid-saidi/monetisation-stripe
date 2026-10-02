import { plans } from "@/lib/stripe/plans";
import SubscribeButton from "@/components/SubscribeButton";

export default function HomePage() {
  return (
    <main>
      <section className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3730a3]">
          Abonnement mensuel
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Basic, Premium, Pro
        </h1>
        <p className="mt-4 text-[#1c1830]/75">
          Stripe facture chaque mois. Le plan actif est stocké dans{" "}
          <code>User.stripePriceId</code>. On ne peut monter que vers un niveau supérieur.
        </p>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="card flex flex-col">
            <p className="text-sm font-semibold text-[#3730a3]">Niveau {plan.level}</p>
            <h2 className="mt-2 font-display text-3xl">{plan.name}</h2>
            <p className="mt-2 text-2xl font-semibold">{plan.price} €<span className="text-base font-medium text-[#1c1830]/60">/mois</span></p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-[#1c1830]/80">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <div className="mt-6">
              {plan.priceId ? (
                <SubscribeButton priceId={plan.priceId} label={`Choisir ${plan.name}`} />
              ) : (
                <p className="text-sm text-amber-800">
                  priceId manquant. Renseignez la variable d&apos;environnement de ce plan.
                </p>
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
