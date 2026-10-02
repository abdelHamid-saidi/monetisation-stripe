# Paiement unique — `paiement-stripe`

Achat de produits et accès premium à 4,99 €, avec Stripe Checkout en mode `payment`.

Stack : Next.js (App Router), Prisma, MySQL, NextAuth (GitHub, Google, email + mot de passe), Stripe, Tailwind CSS.

## Installation

Prérequis : Node.js 18+, MySQL 8 (ou Docker), un compte Stripe en mode test, et [Stripe CLI](https://stripe.com/docs/stripe-cli) pour les webhooks.

```powershell
cd paiement-stripe
npm install
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Collez la chaîne générée dans `NEXTAUTH_SECRET`. Renseignez `STRIPE_SECRET_KEY` (`sk_test_...`) et `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (`pk_test_...`) depuis le Dashboard Stripe. Les clés OAuth sont facultatives.

Base locale avec Docker :

```powershell
docker compose up -d
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Dans un second terminal :

```powershell
stripe listen --forward-to localhost:3000/api/webhook
```

Copiez le secret `whsec_...` affiché dans `STRIPE_WEBHOOK_SECRET`, puis relancez `npm run dev`.

Ouvrez http://localhost:3000, créez un compte, puis payez avec la carte de test `4242 4242 4242 4242`.

## Ce que fait l'application

- L'accueil propose l'accès premium. S'il est déjà actif (`User.hasPaid`), le bouton disparaît.
- `/products` liste les produits du seed et envoie un Checkout par article.
- `/api/checkout` refuse les visiteurs non connectés, crée le client Stripe s'il n'existe pas, et ouvre une session `mode: "payment"` en euros, prix en centimes.
- `/api/webhook` vérifie la signature. Pour `purchaseType = product`, une commande et ses lignes sont créées. Sinon, `hasPaid` passe à `true`.
- La page `/payment-success` n'active rien toute seule.

## Informations absentes du PDF

Le guide montre des extraits. Les points suivants ont été complétés pour que le projet démarre, et ne figurent pas tels quels dans le PDF :

- Versions des paquets, et choix de `bcryptjs` (même appel `bcrypt.compare`, sans compilation native).
- Modèles NextAuth `Account`, `Session`, `VerificationToken`, plus `emailVerified` et `image`.
- Champ `hashedPassword`, utilisé par l'extrait `authorize` mais absent du modèle `User`.
- Modèle `OrderItem`, relation `Order.user`, `createdAt`, et `stripeCheckoutSessionId` pour ignorer un webhook renvoyé deux fois.
- Contenu de `prisma/seed.ts` et images de `public/products/`. Trois produits de démonstration sont fournis. La casquette Next.js à 19,99 € reste l'exercice du guide.
- Création du client Stripe quand `stripeCustomerId` est vide.
- `purchaseType` et `productId` placés dans `metadata`, car le webhook les lit sans montrer où ils sont écrits.
- Pages et route d'inscription (`/register`, `/api/register`). Le guide dit « créer un compte » sans code. Mot de passe : 8 caractères minimum, hash à 10 tours.
- `authorize` renvoie l'identifiant, le nom et l'email. L'extrait renvoie l'utilisateur entier, donc le hash.
- Stratégie de session `jwt`, impliquée par les callbacks du PDF.
- Configuration NextAuth dans `src/lib/auth.ts`. Next.js n'accepte pas d'exporter `authOptions` depuis `route.ts`.
- Page `/cancel`, citée par `cancel_url`, sans écran.
- Page « Mes commandes ». Le schéma enregistre les commandes, aucun écran n'est décrit.
- Taux de la réduction premium. Le texte l'annonce, aucun montant n'est donné : les prix ne sont pas modifiés.
- Panier multi-produits. Chaque paiement contient un seul article.
- Nom exact des variables OAuth, `DATABASE_URL` et `NEXTAUTH_SECRET`.
- Installation de MySQL. Le `docker-compose.yml` est un ajout local (utilisateur `stripe`, mot de passe `stripe`, base `paiement_stripe`).

Les exercices (portail client, codes promo, essai gratuit) ne sont pas implémentés. La dernière page du PDF cite aussi `paiement-stripe-2/` et `GUIDE_COMPLET.md`, qui ne sont pas dans le fichier fourni.
