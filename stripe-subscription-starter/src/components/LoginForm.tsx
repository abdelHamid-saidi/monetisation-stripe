"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginForm({
  callbackUrl,
  error,
}: {
  callbackUrl: string;
  error?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    await signIn("credentials", { email, password, callbackUrl });
    setPending(false);
  }

  return (
    <div className="card">
      <h1 className="font-display text-3xl font-semibold">Connexion</h1>
      <p className="mt-2 text-sm text-[#1c1830]/70">Authentification par email et mot de passe uniquement.</p>
      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">Identifiants refusés.</p>
      ) : null}
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input className="field" type="email" required placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="field" type="password" required placeholder="Mot de passe" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="btn w-full" type="submit" disabled={pending}>
          {pending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold underline">
          Inscription
        </Link>
      </p>
    </div>
  );
}
