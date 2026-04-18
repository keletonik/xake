import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XAKE",
  description: "Premium dark-theme trading decision cockpit",
  icons: { icon: "/favicon.ico" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
