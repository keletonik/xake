import { NextResponse, type NextRequest } from "next/server";

/**
 * Workspace middleware.
 *
 * Two modes.
 *   1. Clerk configured. Protects `/app/*` and `/api/*` so only signed-in
 *      users (or an explicit browser-scoped demo session) can reach state.
 *      Session uid is promoted onto the REQUEST headers so the Hono app
 *      can read it without importing Clerk.
 *   2. Clerk not configured. The demo fallback stamps the shared
 *      `DEMO_ACCOUNT_ID`. Safe for local development and clearly labelled
 *      preview deployments.
 *
 * The demo session is an isolated, per-browser account identified by the
 * `xake-demo-id` cookie. When it is present, API calls are authorised
 * against that demo id; the dedicated demo pages remain available even
 * when Clerk auth would otherwise redirect.
 */

const CLERK_ENABLED = !!process.env.CLERK_SECRET_KEY;
const DEMO_ID = process.env.DEMO_ACCOUNT_ID ?? "demo-account";

const hasDemoCookie = (req: NextRequest): boolean =>
  !!req.cookies.get("xake-demo-id")?.value;

let clerkMiddlewareImpl:
  | ((req: NextRequest) => Promise<NextResponse> | NextResponse)
  | null = null;

if (CLERK_ENABLED) {
  try {
    const mod = await import("@clerk/nextjs/server");
    const handler = mod.clerkMiddleware(async (auth, req: NextRequest) => {
      const path = req.nextUrl.pathname;
      const isApp = path.startsWith("/app");
      const isApi = path.startsWith("/api");
      const demo = hasDemoCookie(req);

      if (!isApp && !isApi) return NextResponse.next();

      const session = await auth();

      if (demo) {
        // Demo sessions skip Clerk enforcement and ride on the cookie.
        return NextResponse.next();
      }

      if (!session?.userId) {
        if (isApi) {
          return new NextResponse(
            JSON.stringify({ error: "UNAUTHENTICATED" }),
            { status: 401, headers: { "content-type": "application/json" } }
          );
        }
        const signIn = new URL("/sign-in", req.url);
        signIn.searchParams.set("redirect_url", path);
        return NextResponse.redirect(signIn);
      }

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

  // Demo fallback stamps request headers so the Hono app can scope state.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-xake-user-id", DEMO_ID);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
