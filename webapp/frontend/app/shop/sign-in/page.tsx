import type { Metadata } from "next";
import { signIn } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign In" };
export const dynamic = "force-dynamic";

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  return (
    <div
      style={{
        maxWidth: "380px",
        margin: "80px auto",
        padding: "0 24px",
      }}
    >
      <p className="text-label" style={{ marginBottom: "16px" }}>Account</p>
      <h1 className="text-heading" style={{ marginBottom: "8px" }}>Sign in.</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "40px", fontSize: "0.875rem" }}>
        Required to add items to your cart or check out.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Google */}
        <form
          action={async () => {
            "use server";
            const sp = await searchParams;
            await signIn("google", { redirectTo: sp.callbackUrl ?? "/shop" });
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 20px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color var(--duration-fast) var(--ease-out)",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
            </svg>
            Continue with Google
          </button>
        </form>

        {/* GitHub */}
        <form
          action={async () => {
            "use server";
            const sp = await searchParams;
            await signIn("github", { redirectTo: sp.callbackUrl ?? "/shop" });
          }}
        >
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 20px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-md)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
              transition: "border-color var(--duration-fast) var(--ease-out)",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
