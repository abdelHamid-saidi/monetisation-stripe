# Paiement unique

Achat de produits et accès premium à 4,99 € avec Stripe Checkout.

Stack : Next.js, Prisma, MySQL, NextAuth, Stripe, Tailwind CSS.

## Installation

Prérequis : Node.js 18+, MySQL (ou Docker), compte Stripe (mode test), [Stripe CLI](https://stripe.com/docs/stripe-cli).

```powershell
npm install
Copy-Item .env.example .env
```

Remplir dans `.env` :

- `NEXTAUTH_SECRET` — générer avec : `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `STRIPE_SECRET_KEY` et `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (clés de test)
- Les clés OAuth (GitHub / Google) sont facultatives

```powershell
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Dans un second terminal :

```powershell
stripe listen --forward-to localhost:3000/api/webhook
```

Copier le secret `whsec_...` dans `STRIPE_WEBHOOK_SECRET`, puis relancer `npm run dev`.

Ouvrir http://localhost:3000, créer un compte, payer avec `4242 4242 4242 4242`.

## Fonctionnalités

- Accueil : accès premium à 4,99 €
- `/products` : catalogue et achat produit par produit
- Webhook : active le premium (`hasPaid`) ou crée une commande
- Auth : email + mot de passe, GitHub et Google (optionnels)
