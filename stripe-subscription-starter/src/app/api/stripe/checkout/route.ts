import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";
import { getPlanByPriceId } from "@/lib/stripe/plans";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { priceId?: string } | null;
  const plan = getPlanByPriceId(body?.priceId);
  if (!plan?.priceId) {
    return NextResponse.json(
      { error: "Plan inconnu ou priceId non configuré dans l'environnement." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscriptions: true },
  });
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const current = getPlanByPriceId(user.stripePriceId);
  if (current && plan.level <= current.level) {
    return NextResponse.json(
      { error: "Le niveau ne permet que les mises à niveau vers un plan supérieur." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const existing = user.subscriptions[0];
    if (existing) {
      if (!current) {
        return NextResponse.json(
          { error: "Abonnement existant dont le plan local est inconnu. Annulez-le avant d'en choisir un autre." },
          { status: 409 }
        );
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(existing.stripeSubscriptionId);
      const itemId = stripeSubscription.items.data[0]?.id;
      if (!itemId) {
        return NextResponse.json({ error: "Ligne d'abonnement Stripe introuvable." }, { status: 409 });
      }

      await stripe.subscriptions.update(existing.stripeSubscriptionId, {
        items: [{ id: itemId, price: plan.priceId }],
        proration_behavior: "create_prorations",
        metadata: { userId: user.id },
      });

      return NextResponse.json({ updated: true });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ id: checkoutSession.id, url: checkoutSession.url });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "";
    const safe = message.includes("manquant")
      ? message
      : "La session d'abonnement n'a pas pu être créée.";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
