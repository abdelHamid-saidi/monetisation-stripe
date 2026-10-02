import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="card mx-auto max-w-xl text-center">
      <h1 className="font-display text-4xl font-semibold">Paiement annulé</h1>
      <p className="mt-4 text-[#1b2430]/75">
        Aucun débit n&apos;a été confirmé. Vous pouvez recommencer quand vous voulez.
      </p>
      <Link href="/" className="btn mt-6">
        Revenir à l&apos;accueil
      </Link>
    </main>
  );
}
