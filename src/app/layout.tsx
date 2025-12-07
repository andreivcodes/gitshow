import "./globals.css";
import { Header } from "@/components/app/header";
import { Footer } from "@/components/app/footer";
import { AnimatedOrbs } from "@/components/app/animated-orbs";
import { Providers } from "@/components/providers/session-provider";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";

const roboto = Roboto({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap", // Prevents FOUC
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "git.show - Show off your GitHub contributions",
    template: "%s | git.show",
  },
  description:
    "Automatically update your Twitter/X banner with your GitHub contribution graph. Choose from 7 themes and set automatic updates.",
  keywords: [
    "github",
    "contributions",
    "twitter banner",
    "x banner",
    "developer tools",
    "github stats",
  ],
  authors: [{ name: "andreivcodes", url: "https://x.com/andreivtweets" }],
  creator: "andreivcodes",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://git.show",
    title: "git.show - Show off your GitHub contributions",
    description: "Automatically update your Twitter/X banner with your GitHub contribution graph.",
    siteName: "git.show",
  },
  twitter: {
    card: "summary_large_image",
    title: "git.show - Show off your GitHub contributions",
    description: "Automatically update your Twitter/X banner with your GitHub contribution graph.",
    creator: "@andreivtweets",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.className}>
      <head>
        {/* Safari streaming buffer threshold workaround */}
        {/* Ensures HTML payload exceeds 1024 bytes for early render */}
        <script
          dangerouslySetInnerHTML={{
            __html: `<!-- ${"x".repeat(1100)} -->`,
          }}
        />
      </head>
      <body className="dark overflow-x-hidden">
        <main className="orb-container flex min-h-screen flex-col items-start sm:items-center justify-between">
          <Providers>
            <AnimatedOrbs />
            <Header />
            {children}
            <Footer />
          </Providers>
          <Toaster position="bottom-right" />
        </main>
      </body>
    </html>
  );
}
