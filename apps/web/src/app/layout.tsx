"use client";

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./(components)/header";
import Feedback from "./(components)/feedback";
import { Footer } from "./(components)/footer";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark">
        <main className="orb-container flex min-h-screen flex-col items-center justify-between">
          <SessionProvider>
            <div className="orb -z-10" />
            <Header />
            {children}
            <Feedback />
            <Footer />
          </SessionProvider>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
