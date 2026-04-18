import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware.
 *
 * Two modes:
 *   1. Clerk configured — delegate to @clerk/nextjs clerkMiddleware,
 *      then stamp X-Xake-User-Id on the outgoing request so the Hono
 *      app can read the caller identity without depending on Clerk.
 *   2. Clerk not configured — pass-through with DEMO_ACCOUNT_ID. Safe
 *      for local dev and preview deployments.
 */

const CLERK_ENABLED = !!process.env.CLERK_SECRET_KEY;

let clerkMiddlewareImpl: ((req: NextRequest) => Promise<NextResponse> | NextResponse) | null = null;

if (CLERK_ENABLED) {
  // Dynamic import keeps the clerk runtime out of the bundle when not configured.
  try {
    const mod = await import("@clerk/nextjs/server");
    const handler = mod.clerkMiddleware(async (auth, req: NextRequest) => {
      const protectedPath = req.nextUrl.pathname.startsWith("/app");
      if (protectedPath) {
        const session = await auth();
        if (!session.userId) {
          const signIn = new URL("/sign-in", req.url);
          signIn.searchParams.set("redirect_url", req.nextUrl.pathname);
          return NextResponse.redirect(signIn);
        }
        const res = NextResponse.next();
        res.headers.set("x-xake-user-id", session.userId);
        return res;
      }
      return NextResponse.next();
    });
    clerkMiddlewareImpl = handler as unknown as typeof clerkMiddlewareImpl;
  } catch {
    clerkMiddlewareImpl = null;
  }
}

export async function middleware(req: NextRequest) {
  if (clerkMiddlewareImpl) return clerkMiddlewareImpl(req);

  const res = NextResponse.next();
  res.headers.set("x-xake-user-id", process.env.DEMO_ACCOUNT_ID ?? "demo-account");
  return res;
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
