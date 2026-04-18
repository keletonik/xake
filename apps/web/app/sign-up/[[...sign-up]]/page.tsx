import { SectionHeader } from "@xake/ui";

export default async function SignUpPage() {
  const hasClerk = !!process.env.CLERK_SECRET_KEY;

  if (hasClerk) {
    const { SignUp } = await import("@clerk/nextjs");
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <SignUp
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
        eyebrow="Sign up"
        title="Clerk not configured"
        description="Configure Clerk to enable account creation. The demo account is available at /app."
      />
    </div>
  );
}
