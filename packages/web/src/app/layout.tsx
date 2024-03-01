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
import { SubscriptionPlan } from "@gitshow/db";

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
  } else
    svg = await contribSvg(
      session.user.githubname,
      session.user.theme,
      session.user.subscriptionPlan
    );

  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <main className="orb-container flex min-h-screen flex-col items-center justify-between">
            <div className="orb -z-10" />
            <Header />
            <div className="flex flex-col xl:flex-row w-full justify-around gap-8 p-4 xl:p-24">
              <Contributions
                name={session?.user.twittername ?? "Linus Torvalds"}
                twittertag={session?.user.twittertag ?? "@Linus__Torvalds"}
                picture={session?.user.twitterimage ?? "/linus.jpeg"}
                svg={svg}
              />
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
