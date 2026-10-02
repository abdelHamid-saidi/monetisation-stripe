import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="card mx-auto max-w-xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
        Stripe Checkout
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold">Paiement envoyé</h1>
      <p className="mt-4 text-[#1b2430]/75">
        Cette page confirme seulement le retour du navigateur. L&apos;accès premium ou la
        commande n&apos;est enregistré qu&apos;après le webhook{" "}
        <code>checkout.session.completed</code>.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn">
          Retour à l&apos;accueil
        </Link>
        <Link href="/products" className="btn-ghost">
          Voir les produits
        </Link>
      </div>
    </main>
  );
}
