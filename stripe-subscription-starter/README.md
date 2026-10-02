# Abonnements — `stripe-subscription-starter`

Trois plans mensuels : Basic 10 €, Premium 25 €, Pro 50 €. Authentification par email et mot de passe. Webhooks Stripe pour l'achat, le renouvellement et l'annulation.

Stack : Next.js (App Router), Prisma, MySQL, NextAuth Credentials, Stripe, Tailwind CSS.

Le PDF ne donne pas l'arborescence de ce projet. Elle reprend les chemins qu'il cite :

- `src/lib/stripe/plans.ts`
- `POST /api/stripe/webhook`
- `GET /api/stripe/get-subscription-status`
- `POST /api/stripe/cancel-subscription`
- page tableau de bord, `/success`, `/cancel`

La création de session est exposée sur `POST /api/stripe/checkout`. Ce chemin n'est pas nommé dans le guide.

## Installation

Prérequis : Node.js 18+, MySQL 8 (ou Docker), Stripe en mode test, Stripe CLI.

```powershell
cd stripe-subscription-starter
npm install
Copy-Item .env.example .env.local
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Dans le Dashboard Stripe, créez trois prix récurrents mensuels (10 €, 25 €, 50 €). Collez leurs identifiants dans :

- `NEXT_PUBLIC_STRIPE_PRICE_BASIC`
- `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM`
- `NEXT_PUBLIC_STRIPE_PRICE_PRO`

Les `price_...` imprimés dans le PDF appartiennent à un autre compte. Ils ne fonctionneront pas sur le vôtre.

```powershell
docker compose up -d
npx prisma migrate dev --name init
npm run dev
```

Le conteneur écoute le port **3307**, pour pouvoir tourner à côté de `paiement-stripe`.

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copiez `whsec_...` dans `STRIPE_WEBHOOK_SECRET` et relancez le serveur. Inscrivez-vous, choisissez un plan, payez avec `4242 4242 4242 4242`.

Les deux applications utilisent le port 3000. Lancez la seconde avec `npm run dev -- -p 3001` et adaptez `NEXTAUTH_URL` ainsi que l'URL de `stripe listen`.

## Webhooks traités

| Événement | Effet |
| --- | --- |
| `checkout.session.completed` | Enregistre le client, le plan et l'abonnement |
| `invoice.payment_succeeded` | Met à jour le prix et la fin de période |
| `customer.subscription.deleted` | Supprime l'abonnement et retire le plan |
| `customer.subscription.updated` | Synchronise une montée de plan |
| `invoice.payment_failed` | Journalisé. Le schéma n'a pas de colonne de statut d'échec |

L'annulation appelle `stripe.subscriptions.cancel`. La base est modifiée par le webhook, pas par la réponse du bouton.

## Informations absentes du PDF

- Arborescence des fichiers, pages de connexion, d'inscription, d'accueil et de succès.
- Algorithme du champ `password`. Il contient un hash bcrypt (10 tours), pas le mot de passe en clair.
- Longueur minimale du mot de passe : 8 caractères.
- Relation Prisma écrite `@relation(...)` dans le guide : complétée avec `userId`.
- Récupération de l'objet Subscription dans les webhooks. Les extraits utilisent `subscription` et `user` sans montrer d'où ils viennent.
- Création du client Stripe s'il n'existe pas encore.
- Montée de plan : le guide dit que `level` interdit de descendre, sans montrer l'appel Stripe. Un abonnement déjà actif est modifié avec `subscriptions.update`, puis synchronisé par `customer.subscription.updated`. Cet événement n'est pas dans la liste des trois webhooks.
- Le tableau de bord du PDF interroge le statut dans le corps du composant. Ici l'appel est dans `useEffect`.
- `session.update()` après annulation est bien appelé. La session relit aussi `stripePriceId` en base à chaque jeton, pour suivre le webhook.
- Variable `BASE_URL` : c'est `NEXTAUTH_URL`.
- Le placeholder `session_id={...}` du PDF est `{CHECKOUT_SESSION_ID}`.
- Portail client, code promo et essai de 7 jours : exercices, non codés.
- `stripe-subscription-recurrent-starter/` et `GUIDE_COMPLET.md` sont cités en fin de PDF, sans contenu.
