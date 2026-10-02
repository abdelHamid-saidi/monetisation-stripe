import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Le PDF prévoit un seed de « produits initiaux » sans en donner la liste.
// Ces trois articles servent uniquement à rendre la page /products utilisable.
// L'exercice « Casquette Next.js à 19,99 € » n'est pas pré-rempli.
const products = [
  {
    name: "T-shirt Cloud Campus",
    description: "Produit de démonstration. Le catalogue n'est pas détaillé dans le guide.",
    price: 29.99,
    image: "/products/tshirt.svg",
  },
  {
    name: "Mug développeur",
    description: "Produit de démonstration. Le catalogue n'est pas détaillé dans le guide.",
    price: 14.5,
    image: "/products/mug.svg",
  },
  {
    name: "Planche de stickers",
    description: "Produit de démonstration. Le catalogue n'est pas détaillé dans le guide.",
    price: 6.9,
    image: "/products/stickers.svg",
  },
];

async function main() {
  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existing) {
      await prisma.product.create({ data: product });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
