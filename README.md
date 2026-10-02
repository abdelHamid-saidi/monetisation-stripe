# Monétisation Stripe

Deux applications issues du guide *Modèles de Monétisation Numérique* (Cloud Campus). Le PDF décrit le flux et montre des extraits. Chaque dossier est un projet Next.js indépendant.

| Dossier | Cas | Mode Stripe |
| --- | --- | --- |
| [`paiement-stripe`](paiement-stripe/README.md) | Paiement unique, produits et accès premium à 4,99 € | `payment` |
| [`stripe-subscription-starter`](stripe-subscription-starter/README.md) | Abonnements Basic 10 €, Premium 25 €, Pro 50 € | `subscription` |

Aucune clé Stripe, OAuth ou secret NextAuth n'est écrite dans le code. Les modèles sont dans `.env.example`.

## Lancer `paiement-stripe`

```powershell
cd paiement-stripe
npm install
Copy-Item .env.example .env
docker compose up -d
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Webhook local :

```powershell
stripe listen --forward-to localhost:3000/api/webhook
```

## Lancer `stripe-subscription-starter`

Créez d'abord les trois prix mensuels dans le Dashboard Stripe, puis :

```powershell
cd stripe-subscription-starter
npm install
Copy-Item .env.example .env.local
docker compose up -d
npx prisma migrate dev --name init
npm run dev
```

Webhook local :

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Le second MySQL est publié sur le port 3307. Pour lancer les deux apps ensemble, démarrez l'une avec `npm run dev -- -p 3001`.

Si MySQL est déjà installé (par exemple WAMP sur le port 3306), créez les bases dessus et gardez le port 3306 dans les deux `DATABASE_URL`. Les migrations ajoutent `ENGINE=InnoDB` : un serveur réglé sur MyISAM refuse l'index unique NextAuth (`provider` + `providerAccountId`) avec l'erreur 1071, clé trop longue.

Carte de test : `4242 4242 4242 4242`.

Le détail de chaque écran, des variables et de ce qui manquait dans le PDF est dans le README de chaque projet.

## Ce que le PDF ne contient pas

- Le code complet : seulement des extraits, parfois coupés (`{...}`, `data: { ... }`, `user.id` sans requête).
- `GUIDE_COMPLET.md`, annoncé comme le guide ligne par ligne.
- Les variantes `paiement-stripe-2/` et `stripe-subscription-recurrent-starter/`, citées sans structure ni code. Elles n'ont pas été créées.
- Le catalogue de produits, les images, l'écran d'inscription, le taux de réduction premium, les versions de paquets, et le moyen d'installer MySQL.
- Des `priceId` d'exemple liés à un compte Stripe tiers. Il faut créer les vôtres.

Les exercices (portail de facturation, coupons, essai de 7 jours, casquette à 19,99 €) restent à faire : le PDF dit que les solutions sont dans `GUIDE_COMPLET.md`, absent de ce dossier.
