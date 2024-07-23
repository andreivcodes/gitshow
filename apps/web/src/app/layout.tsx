import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "./_components/header";
import Feedback from "./_components/feedback";
import { Footer } from "./_components/footer";
import { contribSvg } from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Suspense, lazy } from "react";

const Contributions = lazy(() => import("./_components/contributions"));

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
    session?.user.theme ?? "githubDark"
  );

  return (
    <html lang="en">
      <body className='dark'>
        <main className="orb-container flex min-h-screen flex-col items-center justify-between">
          <div className="orb -z-10" />
          <Header />
          <div className="flex w-full flex-col justify-around gap-8 p-4 xl:flex-row xl:p-24">
            <Suspense fallback={<div>Loading...</div>}>
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
      </body>
    </html>
  );
}
