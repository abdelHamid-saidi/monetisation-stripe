import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PayNowButton from "@/components/PayNowButton";

export const dynamic = "force-dynamic";

function euros(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  const [products, orders, user] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" } }),
    session?.user?.id
      ? prisma.order.findMany({
          where: { userId: session.user.id },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    session?.user?.id
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { hasPaid: true },
        })
      : Promise.resolve(null),
  ]);

  return (
    <main className="space-y-10">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
          Boutique
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Produits</h1>
        <p className="mt-3 max-w-2xl text-[#1b2430]/75">
          Chaque achat crée une commande et ses lignes après le webhook. Le taux de
          réduction premium n&apos;est pas indiqué dans le guide : les prix affichés sont
          ceux de la base.
        </p>
        {user?.hasPaid ? (
          <p className="mt-3 text-sm font-medium text-[#0f766e]">
            Accès premium actif. Le guide mentionne des réductions, sans montant.
          </p>
        ) : null}
      </section>

      {products.length === 0 ? (
        <p className="card">
          Aucun produit. Lancez <code>npx prisma db seed</code> après la migration.
        </p>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="card flex flex-col">
              {product.image ? (
                // Les visuels du PDF ne sont pas fournis : SVG de démonstration.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image}
                  alt={product.name}
                  className="mb-4 h-36 w-full rounded-2xl object-cover"
                />
              ) : null}
              <h2 className="font-display text-2xl">{product.name}</h2>
              {product.description ? (
                <p className="mt-2 flex-1 text-sm text-[#1b2430]/70">{product.description}</p>
              ) : null}
              <p className="mt-4 text-lg font-semibold">{euros(product.price)}</p>
              <div className="mt-4">
                <PayNowButton productId={product.id} label="Acheter" />
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="card">
        <h2 className="font-display text-2xl">Mes commandes</h2>
        {!session ? (
          <p className="mt-3 text-sm">
            <Link href="/login?callbackUrl=/products" className="underline">
              Connectez-vous
            </Link>{" "}
            pour voir vos commandes.
          </p>
        ) : orders.length === 0 ? (
          <p className="mt-3 text-sm text-[#1b2430]/70">Aucune commande pour le moment.</p>
        ) : (
          <ul className="mt-4 divide-y divide-[#1b2430]/10">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                  {order.items.map((item) => item.product.name).join(", ") || "Commande"}
                </span>
                <span className="text-[#1b2430]/70">
                  {order.status === "paid" ? "Payée" : order.status} · {euros(order.total)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
