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

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  verification: {
    other: {
      "wot-verification": ["734e06407bac5599b9c5"],
    },
  },
  ...(siteConfig.favicon && {
    icons: {
      icon: siteConfig.favicon,
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
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