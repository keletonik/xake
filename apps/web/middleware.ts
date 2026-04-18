import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js middleware.
 *
 * Two modes:
 *   1. Clerk configured — `clerkMiddleware` protects `/app/*` and writes
 *      `x-xake-user-id` into the REQUEST headers so the Hono route
 *      handler can read the caller identity without importing Clerk.
 *   2. Clerk not configured — pass-through with `DEMO_ACCOUNT_ID`. Safe
 *      for local dev and preview deployments.
 *
 * The request-header trick is what lets `apps/api` stay framework
 * agnostic: it never imports Clerk. `currentAccountId(c)` reads the
 * stamped header.
 */

const CLERK_ENABLED = !!process.env.CLERK_SECRET_KEY;
const DEMO_ID = process.env.DEMO_ACCOUNT_ID ?? "demo-account";

let clerkMiddlewareImpl:
  | ((req: NextRequest) => Promise<NextResponse> | NextResponse)
  | null = null;

if (CLERK_ENABLED) {
  try {
    const mod = await import("@clerk/nextjs/server");
    const handler = mod.clerkMiddleware(async (auth, req: NextRequest) => {
      const isApp = req.nextUrl.pathname.startsWith("/app");
      const isApi = req.nextUrl.pathname.startsWith("/api");
      const session = isApp || isApi ? await auth() : null;

      if (isApp && !session?.userId) {
        const signIn = new URL("/sign-in", req.url);
        signIn.searchParams.set("redirect_url", req.nextUrl.pathname);
        return NextResponse.redirect(signIn);
      }

      if (!session?.userId) return NextResponse.next();

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-xake-user-id", session.userId);
      return NextResponse.next({ request: { headers: requestHeaders } });
    });
    clerkMiddlewareImpl = handler as unknown as typeof clerkMiddlewareImpl;
  } catch {
    clerkMiddlewareImpl = null;
  }
}

export async function middleware(req: NextRequest) {
  if (clerkMiddlewareImpl) return clerkMiddlewareImpl(req);

  // Demo fallback — stamp request headers so the Hono app can scope state.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-xake-user-id", DEMO_ID);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
