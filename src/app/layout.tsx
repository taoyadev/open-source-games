import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://osgames.dev",
  ),
  title: {
    default: "OpenGames - Discover Open Source Games",
    template: "%s | OpenGames",
  },
  description:
    "Discover and explore the best open source games. Browse hundreds of free games across all genres, from action to puzzle, strategy to RPG.",
  keywords: [
    "open source games",
    "free games",
    "github games",
    "indie games",
    "game development",
    "open source",
  ],
  authors: [{ name: "OpenGames Team" }],
  creator: "OpenGames",
  publisher: "OpenGames",
  manifest: "/site.webmanifest",
  themeColor: "#18181b",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "OpenGames",
    title: "OpenGames - Discover Open Source Games",
    description:
      "Discover and explore the best open source games. Browse hundreds of free games across all genres.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "OpenGames - Discover Open Source Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenGames - Discover Open Source Games",
    description:
      "Discover and explore the best open source games. Browse hundreds of free games across all genres.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col bg-white font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100`}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
