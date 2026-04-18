import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider, THEME_BOOTSTRAP_SCRIPT, ToastProvider, TooltipProvider } from "@xake/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "XAKE — premium trading cockpit",
  description: "A dark, terminal-grade trading decision cockpit. Chart-first, modular, and built for operators."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      <body>
        <ThemeProvider>
          <TooltipProvider delayDuration={150}>
            <ToastProvider>{children}</ToastProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
