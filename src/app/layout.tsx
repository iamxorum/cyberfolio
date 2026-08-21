import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { JetBrains_Mono } from "next/font/google";
import { siteConfig, scripts, experience, education, getTopSkills } from "../config";
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

const currentRole = experience.find(
  (exp) => !exp.endDate || exp.endDate.toLowerCase() === "ongoing"
);

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
  ...(currentRole && {
    worksFor: {
      "@type": "Organization",
      name: currentRole.company,
    },
  }),
  ...(education.length > 0 && {
    alumniOf: education.map((edu) => ({
      "@type": "EducationalOrganization",
      name: edu.institution,
    })),
  }),
  knowsAbout: getTopSkills(15).map((skill) => skill.name),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Loaded via preload+swap so the icon font stylesheet doesn't block first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var h='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';var p=document.createElement('link');p.rel='preload';p.as='style';p.href=h;document.head.appendChild(p);var l=document.createElement('link');l.rel='stylesheet';l.href=h;l.media='print';l.onload=function(){this.media='all';};document.head.appendChild(l);})();`,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
            rel="stylesheet"
          />
        </noscript>
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: `.boot-screen-overlay{display:none !important;}` }} />
        </noscript>
        {/* Applied before hydration to avoid a flash of the wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var root=document.documentElement;if(t==='light'){root.classList.remove('dark');root.classList.add('light');}else{root.classList.remove('light');root.classList.add('dark');}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('iamxorum_initialized');if(t&&(Date.now()-parseInt(t))<86400000){document.documentElement.classList.add('boot-skip');}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('iamxorum_turnstile_verified');if(t&&(Date.now()-parseInt(t))<86400000){document.documentElement.classList.add('turnstile-skip');}}catch(e){}})();`,
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
        <ViewTransition
          enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
          exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
          default="none"
        >
          {children}
        </ViewTransition>
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