import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") {
        break;
      }

      const userId = session.metadata?.userId;
      const purchaseType = session.metadata?.purchaseType;
      if (!userId) {
        console.error("checkout.session.completed sans userId", session.id);
        break;
      }

      if (purchaseType === "product") {
        const productId = session.metadata?.productId;
        if (!productId) {
          console.error("Achat produit sans productId", session.id);
          break;
        }

        const product = await prisma.product.findUnique({
          where: { id: productId },
        });
        if (!product) {
          console.error("Produit introuvable pour la commande", productId);
          break;
        }

        try {
          await prisma.order.create({
            data: {
              userId,
              status: "paid",
              total: product.price,
              stripeCheckoutSessionId: session.id,
              items: {
                create: {
                  productId: product.id,
                  quantity: 1,
                  price: product.price,
                },
              },
            },
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            break;
          }
          throw error;
        }
      } else {
        await prisma.user.update({
          where: { id: userId },
          data: { hasPaid: true },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
