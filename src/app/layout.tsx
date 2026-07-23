import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { siteConfig, scripts } from "../config";
import "./globals.css";
import Script from "next/script";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = `https://${siteConfig.domain}`;

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
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteUrl,
    siteName: siteConfig.title,
    images: [siteConfig.profileImage],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.profileImage],
  },
  ...(siteConfig.favicon && {
    icons: {
      icon: siteConfig.favicon,
    },
  }),
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.fullName,
  alternateName: siteConfig.username,
  url: siteUrl,
  jobTitle: siteConfig.role,
  description: siteConfig.description,
  sameAs: (siteConfig.social.professional || [])
    .filter((link) => link.showInFooter)
    .map((link) => link.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* Applied before hydration to avoid a flash of the wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var root=document.documentElement;if(t==='light'){root.classList.remove('dark');root.classList.add('light');}else{root.classList.remove('light');root.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body
        className={`${jetBrainsMono.variable} antialiased font-display`}
      >
        {children}
        {scripts.map((script, index) => {
          const dataProps = script.dataAttributes
            ? Object.entries(script.dataAttributes).reduce((acc, [key, value]) => {
              acc[`data-${key}`] = value;
              return acc;
            }, {} as Record<string, string>)
            : {};

          return (
            <Script
              key={script.id || `script-${index}`}
              id={script.id}
              src={script.src}
              strategy={script.strategy}
              {...dataProps}
            />
          );
        })}
      </body>
    </html>
  );
}