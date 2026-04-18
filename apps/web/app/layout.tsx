import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider, THEME_BOOTSTRAP_SCRIPT, ToastProvider, TooltipProvider } from "@xake/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "XAKE — premium trading cockpit",
  description:
    "A dark, terminal-grade trading decision cockpit. Chart-first, modular, and built for operators who want signal without the noise.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "XAKE",
    description: "A premium trading cockpit. Analysis, paper trading, and a Claude-powered co-pilot.",
    type: "website"
  },
  icons: { icon: "/favicon.ico" }
};

const CLERK_ENABLED = !!process.env.CLERK_SECRET_KEY && !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

async function Providers({ children }: { children: ReactNode }) {
  const inner = (
    <ThemeProvider>
      <TooltipProvider delayDuration={150}>
        <ToastProvider>{children}</ToastProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
  if (!CLERK_ENABLED) return inner;
  const { ClerkProvider } = await import("@clerk/nextjs");
  return <ClerkProvider>{inner}</ClerkProvider>;
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const body = await Providers({ children });
  return (
    <html
      lang="en-AU"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      style={{
        ["--font-geist-sans" as string]: GeistSans.style.fontFamily,
        ["--font-geist-mono" as string]: GeistMono.style.fontFamily
      }}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body>{body}</body>
    </html>
  );
}
