import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brcktrckr.com";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BrckTrckr | LEGO Set Value Analytics",
    template: "%s | BrckTrckr",
  },
  description:
    "Free LEGO analytics for BrickLinkers. Explore set inventory value, compare themes, and discover top sets by piece count, part value, and profitability signals.",
  applicationName: "BrckTrckr",
  keywords: [
    "LEGO set value",
    "BrickLink analytics",
    "LEGO part out",
    "LEGO investment",
    "LEGO set explorer",
    "LEGO pricing data",
    "BrickLink seller tools",
    "set ranking",
  ],
  authors: [{ name: "Anton" }],
  creator: "Anton",
  publisher: "BrckTrckr",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "BrckTrckr",
    title: "BrckTrckr | LEGO Set Value Analytics",
    description:
      "Free LEGO analytics for BrickLinkers. Explore set inventory value, compare themes, and discover top sets by piece count, part value, and profitability signals.",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrckTrckr | LEGO Set Value Analytics",
    description:
      "Free LEGO analytics for BrickLinkers. Explore set inventory value, compare themes, and discover top sets by piece count, part value, and profitability signals.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🔍</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var key = "theme-preference";
                var stored = localStorage.getItem(key);
                var preference = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
                var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                var shouldUseDark = preference === "dark" || (preference === "system" && prefersDark);
                document.documentElement.classList.toggle("dark", shouldUseDark);
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
