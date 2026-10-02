export type Plan = {
  name: string;
  price: number;
  level: number;
  priceId: string;
  features: string[];
};

// Les priceId du PDF appartiennent à un compte Stripe de démonstration.
// Ils sont lus depuis l'environnement pour que chacun colle les siens,
// comme l'indique l'étape « copier les priceId dans src/lib/stripe/plans.ts ».
export const plans: Plan[] = [
  {
    name: "Basic",
    price: 10,
    level: 1,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC ?? "",
    features: ["Basic Feature 1", "Basic Feature 2"],
  },
  {
    name: "Premium",
    price: 25,
    level: 2,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM ?? "",
    features: ["Premium Feature 1", "Premium Feature 2"],
  },
  {
    name: "Pro",
    price: 50,
    level: 3,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ?? "",
    features: ["Pro Feature 1", "Pro Feature 2"],
  },
];

export function getPlanByPriceId(priceId?: string | null) {
  if (!priceId) return null;
  return plans.find((plan) => plan.priceId && plan.priceId === priceId) ?? null;
}
