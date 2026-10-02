import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, periodEnd } from "@/lib/stripe/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    orderBy: { stripeCurrentPeriodEnd: "desc" },
  });

  if (!subscription) {
    return NextResponse.json({ status: "none", subscriptionId: null, currentPeriodEnd: null });
  }

  try {
    const stripeSubscription = await getStripe().subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    return NextResponse.json({
      status: stripeSubscription.status,
      subscriptionId: stripeSubscription.id,
      currentPeriodEnd: periodEnd(stripeSubscription).toISOString(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Statut Stripe indisponible." },
      { status: 502 }
    );
  }
}
