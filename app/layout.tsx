import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MatchRoom — See the next pitch before they throw it.",
  description:
    "MatchRoom turns real Statcast data into a verified coaching brief — scout, skeptic, and coach-ready output in minutes. Built on real MLB data. No invented numbers.",
  metadataBase: new URL("https://matchroom.plexaura.com"),
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "MatchRoom — Verified AI coaching room for baseball",
    description:
      "Real Statcast data → scout agent → skeptic agent → verified coach-ready brief.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-bg font-sans text-text antialiased">
        {children}
      </body>
    </html>
  );
}
