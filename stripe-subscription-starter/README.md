# Abonnements Stripe

Trois plans mensuels : Basic 10 €, Premium 25 €, Pro 50 €.

Stack : Next.js, Prisma, MySQL, NextAuth, Stripe, Tailwind CSS.

## Installation

Prérequis : Node.js 18+, MySQL (ou Docker), compte Stripe (mode test), [Stripe CLI](https://stripe.com/docs/stripe-cli).

```powershell
npm install
Copy-Item .env.example .env.local
```

Remplir dans `.env.local` :

- `NEXTAUTH_SECRET` — générer avec : `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (clés de test)
- Les 3 `priceId` créés dans le Dashboard Stripe (produits récurrents mensuels) :
  - `NEXT_PUBLIC_STRIPE_PRICE_BASIC`
  - `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM`
  - `NEXT_PUBLIC_STRIPE_PRICE_PRO`

```powershell
docker compose up -d
npx prisma migrate dev
npm run dev
```

Dans un second terminal :

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copier le secret `whsec_...` dans `STRIPE_WEBHOOK_SECRET`, puis relancer `npm run dev`.

Ouvrir http://localhost:3000, s'inscrire, choisir un plan, payer avec `4242 4242 4242 4242`.

## Fonctionnalités

- 3 plans avec montée de niveau uniquement
- Tableau de bord : plan actuel, statut, annulation
- Webhooks : premier paiement, renouvellement, mise à jour, annulation
- Auth : email + mot de passe uniquement
