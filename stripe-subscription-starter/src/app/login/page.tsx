import LoginForm from "@/components/LoginForm";

function safeCallback(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  return (
    <main className="mx-auto max-w-md">
      <LoginForm callbackUrl={safeCallback(searchParams.callbackUrl)} error={searchParams.error} />
    </main>
  );
}
