# Monétisation Stripe

Deux projets Next.js indépendants :

| Projet | Description |
| --- | --- |
| [`paiement-stripe`](paiement-stripe/README.md) | Paiement unique (produits + accès premium 4,99 €) |
| [`stripe-subscription-starter`](stripe-subscription-starter/README.md) | Abonnements Basic / Premium / Pro |

## Démarrage rapide

**Paiement unique**

```powershell
cd paiement-stripe
npm install
Copy-Item .env.example .env
# Remplir les clés dans .env
docker compose up -d
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Webhook : `stripe listen --forward-to localhost:3000/api/webhook`

**Abonnements**

```powershell
cd stripe-subscription-starter
npm install
Copy-Item .env.example .env.local
# Remplir les clés et priceId dans .env.local
docker compose up -d
npx prisma migrate dev
npm run dev
```

Webhook : `stripe listen --forward-to localhost:3000/api/stripe/webhook`

Pour lancer les deux apps en même temps, démarrez la seconde sur un autre port : `npm run dev -- -p 3001`.

Carte de test Stripe : `4242 4242 4242 4242`
