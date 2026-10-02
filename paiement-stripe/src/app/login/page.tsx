import LoginForm from "@/components/LoginForm";

function safeCallback(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string };
}) {
  return (
    <main className="mx-auto max-w-md">
      <LoginForm
        callbackUrl={safeCallback(searchParams.callbackUrl)}
        error={searchParams.error}
        githubEnabled={Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET)}
        googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)}
      />
    </main>
  );
}
