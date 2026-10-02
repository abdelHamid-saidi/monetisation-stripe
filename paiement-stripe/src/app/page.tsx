import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PREMIUM_PRICE_LABEL } from "@/lib/premium";
import { prisma } from "@/lib/prisma";
import PayNowButton from "@/components/PayNowButton";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { hasPaid: true },
      })
    : null;

  const hasActiveSubscription = Boolean(user?.hasPaid);

  return (
    <main className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="card">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Paiement unique
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Accès Premium – {PREMIUM_PRICE_LABEL}
        </h1>
        <p className="mt-4 max-w-xl text-[#1b2430]/75">
          Un paiement définitif active l&apos;accès premium. La base n&apos;est mise à jour
          que lorsque Stripe confirme le webhook <code>checkout.session.completed</code>.
        </p>

        <div className="mt-8">
          {!hasActiveSubscription ? (
            <PayNowButton />
          ) : (
            <div>
              <p className="text-lg font-semibold">✅ Vous avez déjà un accès Premium !</p>
              <ul className="mt-4 space-y-2 text-[#1b2430]/80">
                <li>Accès à des contenus exclusifs</li>
                <li>Des réductions sur les produits</li>
                <li>Une expérience utilisateur améliorée</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      <aside className="card bg-[#143d3a] text-[#f6f1e8]">
        <h2 className="font-display text-2xl">Ce que couvre cet achat</h2>
        <ol className="mt-4 space-y-3 text-sm leading-6 text-[#f6f1e8]/85">
          <li>1. Connexion, puis clic sur Payer maintenant.</li>
          <li>2. Redirection vers Stripe Checkout, en euros.</li>
          <li>3. Le webhook active <span className="font-semibold">hasPaid</span>.</li>
        </ol>
        <p className="mt-6 text-sm text-[#f6f1e8]/70">
          Carte de test Stripe : 4242 4242 4242 4242, une date future et un CVC quelconque.
        </p>
      </aside>
    </main>
  );
}
