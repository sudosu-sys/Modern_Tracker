// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Modern Tracker",
  description: "Unify your business in one platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexend.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
