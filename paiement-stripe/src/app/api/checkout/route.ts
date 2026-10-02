import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PREMIUM_NAME, PREMIUM_PRICE_CENTS } from "@/lib/premium";
import { getStripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    purchaseType?: string;
    productId?: string;
  };
  const purchaseType = body.purchaseType === "product" ? "product" : "premium";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const stripe = getStripe();
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const origin = process.env.NEXTAUTH_URL ?? new URL(req.url).origin;
    const metadata: Record<string, string> = {
      userId: session.user.id,
      purchaseType,
    };

    let lineItem: {
      price_data: {
        currency: "eur";
        product_data: { name: string; description?: string };
        unit_amount: number;
      };
      quantity: number;
    };

    if (purchaseType === "product") {
      if (!body.productId) {
        return NextResponse.json({ error: "productId manquant." }, { status: 400 });
      }

      const product = await prisma.product.findUnique({
        where: { id: body.productId },
      });
      if (!product) {
        return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
      }

      metadata.productId = product.id;
      lineItem = {
        price_data: {
          currency: "eur",
          product_data: {
            name: product.name,
            description: product.description ?? undefined,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      };
    } else {
      lineItem = {
        price_data: {
          currency: "eur",
          product_data: { name: PREMIUM_NAME },
          unit_amount: PREMIUM_PRICE_CENTS,
        },
        quantity: 1,
      };
    }

    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "payment",
      line_items: [lineItem],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata,
    });

    return NextResponse.json({ id: stripeSession.id });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "";
    const safe = message.includes("manquant")
      ? message
      : "Le paiement n'a pas pu être créé.";
    return NextResponse.json({ error: safe }, { status: 500 });
  }
}
