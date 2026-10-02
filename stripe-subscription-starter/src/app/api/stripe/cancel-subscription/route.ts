import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { subscriptionId?: string } | null;
  if (!body?.subscriptionId) {
    return NextResponse.json({ error: "subscriptionId manquant." }, { status: 400 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: body.subscriptionId },
  });

  if (!subscription || subscription.userId !== session.user.id) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    await getStripe().subscriptions.cancel(body.subscriptionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "L'annulation Stripe a échoué." },
      { status: 502 }
    );
  }
}
