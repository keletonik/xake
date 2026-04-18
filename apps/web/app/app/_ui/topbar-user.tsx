import { Badge, EnvBadge } from "@xake/ui";

/**
 * Topbar user slot. With Clerk configured, renders the Clerk UserButton
 * so sign-out and account management work. Without Clerk, renders a
 * demo-account badge.
 */

export async function TopbarUser() {
  const hasClerk = !!process.env.CLERK_SECRET_KEY;

  if (hasClerk) {
    const { UserButton } = await import("@clerk/nextjs");
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)" }}>
        <EnvBadge env="paper" />
        <UserButton afterSignOutUrl="/" />
      </div>
    );
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)" }}>
      <EnvBadge env="paper" />
      <Badge tone="info">demo account</Badge>
    </div>
  );
}
