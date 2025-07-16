"use client";

import "./globals.css";
import { Header } from "@/components/app/header";
import Feedback from "@/components/app/feedback";
import { Footer } from "@/components/app/footer";
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
      </body>
    </html>
  );
}
