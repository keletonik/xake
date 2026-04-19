import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

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

type NextMiddlewareFn = (
  req: NextRequest,
  event: NextFetchEvent
) => Promise<NextResponse | undefined> | NextResponse | undefined;

const hasDemoCookie = (req: NextRequest): boolean =>
  !!req.cookies.get("xake-demo-id")?.value;

const demoFallback = (req: NextRequest): NextResponse => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-xake-user-id", DEMO_ID);
  return NextResponse.next({ request: { headers: requestHeaders } });
};

const buildClerkHandler = async (): Promise<NextMiddlewareFn | null> => {
  if (!CLERK_ENABLED) return null;
  try {
    const mod = await import("@clerk/nextjs/server");
    return mod.clerkMiddleware(async (auth, req) => {
      const path = req.nextUrl.pathname;
      const isApp = path.startsWith("/app");
      const isApi = path.startsWith("/api");
      if (!isApp && !isApi) return NextResponse.next();

      if (hasDemoCookie(req)) return NextResponse.next();

      const session = await auth();

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
    }) as unknown as NextMiddlewareFn;
  } catch {
    return null;
  }
};

// Initialise once per Edge worker cold start. Awaited inside the
// exported middleware so Next always receives a valid function.
const clerkHandlerPromise: Promise<NextMiddlewareFn | null> = buildClerkHandler();

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const clerk = await clerkHandlerPromise;
  if (clerk) {
    const response = await clerk(req, event);
    return response ?? NextResponse.next();
  }
  return demoFallback(req);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"]
};
