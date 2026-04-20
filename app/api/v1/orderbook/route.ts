import { NextResponse } from "next/server";
import { getMarketProvider } from "@/lib/data-core/mock-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = url.searchParams.get("symbol");
  const depth = Math.max(1, Math.min(30, Number(url.searchParams.get("depth") ?? 15)));

  if (!symbol) return NextResponse.json({ error: "missing symbol" }, { status: 400 });

  const book = getMarketProvider().getOrderBook(symbol, depth);
  if (!book) return NextResponse.json({ error: "unknown symbol" }, { status: 404 });

  return NextResponse.json({ book });
}
