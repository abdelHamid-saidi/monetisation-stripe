import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe, periodEnd } from "@/lib/stripe/client";

export const dynamic = "force-dynamic";

function subscriptionIdFromInvoice(invoice: Stripe.Invoice) {
  const loose = invoice as Stripe.Invoice & {
    subscription?: string | { id: string } | null;
    parent?: {
      type?: string;
      subscription_details?: {
        subscription?: string | { id: string } | null;
      } | null;
    } | null;
  };

  if (typeof loose.subscription === "string") return loose.subscription;
  if (loose.subscription && typeof loose.subscription === "object") return loose.subscription.id;

  const subscription = loose.parent?.subscription_details?.subscription;
  if (typeof subscription === "string") return subscription;
  if (subscription && typeof subscription === "object") return subscription.id;
  return null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new NextResponse("Signature manquante", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error(error);
    return new NextResponse("Signature invalide", { status: 400 });
  }

  const stripe = getStripe();

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.mode !== "subscription") break;

      const subscriptionId =
        typeof checkoutSession.subscription === "string"
          ? checkoutSession.subscription
          : checkoutSession.subscription?.id;
      const userId = checkoutSession.metadata?.userId;

      if (!subscriptionId || !userId) {
        console.error("checkout.session.completed incomplet", checkoutSession.id);
        break;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      if (!priceId) break;

      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId:
            typeof checkoutSession.customer === "string"
              ? checkoutSession.customer
              : checkoutSession.customer?.id,
          stripePriceId: priceId,
        },
      });

      await prisma.subscription.upsert({
        where: { stripeSubscriptionId: subscription.id },
        create: {
          user: { connect: { id: userId } },
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: periodEnd(subscription),
        },
        update: {
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: periodEnd(subscription),
        },
      });
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = subscriptionIdFromInvoice(invoice);
      if (!subscriptionId) break;

      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = subscription.items.data[0]?.price.id;
      if (!priceId) break;

      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!existing) break;

      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: periodEnd(subscription),
        },
      });
      await prisma.user.update({
        where: { id: existing.userId },
        data: { stripePriceId: priceId },
      });
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;
      if (!priceId) break;

      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscription.id },
      });
      if (!existing) break;

      await prisma.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: periodEnd(subscription),
        },
      });
      await prisma.user.update({
        where: { id: existing.userId },
        data: { stripePriceId: priceId },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const subscriptionDeleted = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: subscriptionDeleted.id },
      });
      if (!existing) break;

      const user = await prisma.user.findUnique({ where: { id: existing.userId } });
      await prisma.subscription.delete({
        where: { stripeSubscriptionId: subscriptionDeleted.id },
      });

      if (user?.stripePriceId === existing.stripePriceId) {
        await prisma.user.update({
          where: { id: existing.userId },
          data: { stripePriceId: null },
        });
      }
      break;
    }
    case "invoice.payment_failed":
      console.error("Échec de paiement d'une facture d'abonnement", event.id);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
