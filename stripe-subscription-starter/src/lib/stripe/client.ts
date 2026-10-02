import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY manquant");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, { typescript: true });
  }

  return stripeClient;
}

export function periodEnd(subscription: Stripe.Subscription) {
  const withLegacy = subscription as Stripe.Subscription & {
    current_period_end?: number;
  };
  const item = subscription.items.data[0] as { current_period_end?: number } | undefined;
  const seconds = withLegacy.current_period_end ?? item?.current_period_end ?? Math.floor(Date.now() / 1000);
  return new Date(seconds * 1000);
}
