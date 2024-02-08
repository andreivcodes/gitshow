import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import Feedback from "@/components/feedback";
import { Footer } from "@/components/footer";
import Contributions from "@/components/contributions";
import { Plans, contribSvg } from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

  const svg = await contribSvg(
    session?.user.githubname ?? "torvalds",
    session?.user.theme ?? "classic",
    session?.user.subscription_type ?? Plans.NONE_PLAN
  );

  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <main className="orb-container flex min-h-screen flex-col items-center justify-between">
            <div className="orb" />
            <Header />
            <div className="flex flex-col xl:flex-row w-full justify-between gap-8 p-4 xl:p-24">
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
