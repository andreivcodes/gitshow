import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./_components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./_components/header";
import Feedback from "./_components/feedback";
import { Footer } from "./_components/footer";
import Contributions from "./_components/contributions";
import { contribSvg } from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { SubscriptionPlan } from "@prisma/client";
import Script from "next/script";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "git.show",
  description: "show off your contributions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  let svg;

  if (!session || !session.user || !session.user.githubname) {
    svg = await contribSvg("torvalds", "githubDark", SubscriptionPlan.PREMIUM);
  } else svg = await contribSvg(session.user.githubname, session.user.theme, session.user.subscriptionPlan);

  return (
    <html lang="en">
      <Script defer data-domain="git.show" src="https://plausible.andreiv.xyz/js/script.js" />
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <main className="orb-container flex min-h-screen flex-col items-center justify-between">
            <div className="orb -z-10" />
            <Header />
            <div className="flex w-full flex-col justify-around gap-8 p-4 xl:flex-row xl:p-24">
              <Suspense>
                <Contributions
                  name={session?.user.twittername ?? "Linus Torvalds"}
                  twittertag={session?.user.twittertag ?? "@Linus__Torvalds"}
                  picture={session?.user.twitterimage ?? "/linus.jpeg"}
                  svg={svg}
                />
              </Suspense>
              {children}
            </div>
            <Feedback />
            <Footer />
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
