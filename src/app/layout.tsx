import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { siteConfig, features, analyticsConfig } from "../config";
import "./globals.css";
import Script from "next/script";
import { cookies, headers } from "next/headers";
import { isAccent } from "@/lib/accent";
import { ACCENT_COOKIE, THEME_COOKIE } from "@/lib/preferences";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollIndicator from "@/components/ScrollIndicator";
import CommandPalette from "@/components/CommandPalette";
import KonamiCode from '@/components/KonamiCode';
import AnalyticsEvents from "@/components/AnalyticsEvents";
import { getSearchIndex } from "@/lib/blog";
import { ANALYTICS_PATH } from "@/lib/analytics";
import { serializeJsonLd } from "@/lib/json-ld";
import { personJsonLd, siteUrl } from '@/lib/seo';

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Material Symbols isn't in next/font/google, so the icon font is self-hosted from
// src/app/fonts (static instance: wght 400, FILL 0). Served from our own origin, preloaded.
const materialSymbols = localFont({
  src: "./fonts/MaterialSymbolsOutlined.woff2",
  variable: "--font-icons",
  display: "block",
  weight: "400",
});


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteConfig.title,
  description: siteConfig.description,
  verification: {
    other: {
      "wot-verification": ["734e06407bac5599b9c5"],
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteUrl,
    siteName: siteConfig.title,
    locale: "en_US",
    type: "website",
    images: [`${siteUrl}/opengraph-image`],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteUrl}/opengraph-image`],
  },
  manifest: '/manifest.webmanifest',
  ...(siteConfig.favicon && {
    icons: {
      icon: siteConfig.favicon,
      apple: '/apple-touch-icon.png',
    },
  }),
};

export const viewport: Viewport = {
  themeColor: '#141022',
};

// Umami tracker, served from this site under /stats. Skips localhost.
const analyticsEnabled = features.analytics && Boolean(analyticsConfig.websiteId);
const analyticsDomains = [siteConfig.domain, ...(siteConfig.alternateDomains ?? [])].flatMap((d) => [d, `www.${d}`]).join(',');

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set per request by proxy.ts. Reading it makes every page render on demand, which a nonce-based CSP requires.
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  // The visitor's saved look is rendered into the first HTML, so there is no flash of the wrong theme.
  const jar = await cookies();
  const theme = jar.get(THEME_COOKIE)?.value === 'light' ? 'light' : 'dark';
  const savedAccent = jar.get(ACCENT_COOKIE)?.value;
  const accent = isAccent(savedAccent) && savedAccent !== 'default' ? savedAccent : undefined;

  return (
    <html
      lang="en"
      // Switched-off features that normally add a class client-side get it here instead, so there is no flash.
      className={[theme, (!features.bootScreen || features.calmMode) && 'boot-skip', !features.scrollIndicator && 'native-scrollbar', features.calmMode && 'calm'].filter(Boolean).join(' ')}
      data-accent={accent}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: `.boot-screen-overlay{display:none !important;}` }} />
        </noscript>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('iamxorum_initialized');if(t&&(Date.now()-parseInt(t))<86400000){document.documentElement.classList.add('boot-skip');}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd()) }}
        />
      </head>
      <body
        className={`${jetBrainsMono.variable} ${materialSymbols.variable} antialiased font-display`}
        // Browser extensions (e.g. ColorZilla) add attributes to <body> before React hydrates.
        suppressHydrationWarning
      >
        <KonamiCode />
        {features.scrollIndicator && <ScrollIndicator />}
        {features.smoothScroll && <SmoothScroll />}
        {features.commandPalette && <CommandPalette posts={getSearchIndex()} />}
        <ViewTransition
          enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
          exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
          default="none"
        >
          {children}
        </ViewTransition>
        {analyticsEnabled && <AnalyticsEvents />}
        {analyticsEnabled && (
          <Script
            src={`${ANALYTICS_PATH}/script.js`}
            nonce={nonce}
            strategy="afterInteractive"
            data-website-id={analyticsConfig.websiteId}
            data-domains={analyticsDomains}
            data-do-not-track="true"
            data-exclude-search="true"
            data-exclude-hash="true"
            data-performance={analyticsConfig.performance ? "true" : "false"}
          />
        )}
      </body>
    </html>
  );
}