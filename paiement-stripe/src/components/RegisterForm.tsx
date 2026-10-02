"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = (await res.json()) as { error?: string };

    if (!res.ok) {
      setError(data.error ?? "Inscription impossible.");
      setPending(false);
      return;
    }

    router.push("/login");
  }

  return (
    <div className="card">
      <h1 className="font-display text-3xl font-semibold">Créer un compte</h1>
      <p className="mt-2 text-sm text-[#1b2430]/70">
        Le guide demande cette étape, sans montrer l&apos;écran ni la route d&apos;inscription.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="field"
          placeholder="Nom (facultatif)"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          className="field"
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          className="field"
          type="password"
          required
          minLength={8}
          placeholder="Mot de passe (8 caractères minimum)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button className="btn w-full" disabled={pending} type="submit">
          {pending ? "Création..." : "Créer le compte"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-semibold underline">
          Connexion
        </Link>
      </p>
    </div>
  );
}
