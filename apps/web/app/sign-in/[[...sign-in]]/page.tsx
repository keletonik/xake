import { SectionHeader } from "@xake/ui";

/**
 * Sign in. If Clerk is configured, render `<SignIn />`. If not,
 * render an explainer so local dev doesn't crash on this route.
 */

export default async function SignInPage() {
  const hasClerk = !!process.env.CLERK_SECRET_KEY;

  if (hasClerk) {
    const { SignIn } = await import("@clerk/nextjs");
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#6EE7F9",
              colorBackground: "#0f131a",
              colorInputBackground: "#151a22",
              colorText: "#F5F7FA",
              fontFamily: "var(--font-sans)"
            }
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px" }}>
      <SectionHeader
        eyebrow="Sign in"
        title="Clerk not configured"
        description="Set CLERK_SECRET_KEY and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable sign-in. Until then, the app runs against a single demo account."
      />
      <p style={{ color: "var(--colour-text-secondary)" }}>
        <a href="/app" style={{ color: "var(--colour-accent)" }}>
          Continue as demo →
        </a>
      </p>
    </div>
  );
}
