import React, { Suspense } from "react";
import type { Metadata } from "next";
import { getCachedSession } from "@/lib/auth";
import SignIn from "@/components/app/signin/signin";
import Settings from "@/components/app/settings/settings";
import Contributions from "@/components/app/contributions";
import { getContributionSvg } from "@/lib/contributions";
import { Card } from "@/components/ui/card";
import { unstable_rethrow } from "next/navigation";

export default function Home() {
  return (
    <div className="flex w-full flex-col gap-8 p-4 xl:grid xl:grid-cols-2 xl:gap-8 xl:p-24 overflow-x-visible sm:overflow-x-clip">
      <div className="xl:flex xl:items-start xl:justify-center">
        <Suspense fallback={<ContributionsLoadingCard />}>
          <ContribsWrapper />
        </Suspense>
      </div>
      <div className="xl:flex xl:items-start xl:justify-center">
        <Suspense fallback={<MenuLoadingCard />}>
          <MenuWrapper />
        </Suspense>
      </div>
    </div>
  );
}

async function ContribsWrapper() {
  const session = await getCachedSession();
  const username = session?.user.githubname ?? "torvalds";

  let svg: string;
  try {
    svg = await getContributionSvg(username, session?.user.theme ?? "githubDark");
  } catch (error) {
    unstable_rethrow(error);
    // Don't let a scraping failure (e.g. browserless unreachable) take down
    // the whole page through error.tsx: sign-in and settings must still work.
    console.error(
      `[Home] Contribution graph unavailable for ${username}:`,
      error instanceof Error ? error.message : error
    );
    return <ContributionsUnavailableCard />;
  }

  return (
    <div className="flex xl:w-auto xl:items-start xl:justify-center">
      <Contributions
        name={session?.user.twittername ?? "Linus Torvalds"}
        twittertag={session?.user.twittertag ?? "@Linus__Torvalds"}
        picture={session?.user.twitterimage ?? "/linus.jpeg"}
        svg={svg}
      />
    </div>
  );
}

async function MenuWrapper() {
  const session = await getCachedSession();
  return session && session.user.twitterAuthenticated && session.user.githubAuthenticated ? (
    <Settings />
  ) : (
    <SignIn />
  );
}

function ContributionsLoadingCard() {
  return (
    <div className="flex xl:w-auto xl:items-start xl:justify-center">
      <div
        className="animate-pulse bg-black/50 rounded-xl relative h-[270px] mr-0 sm:mx-4 w-[566px] min-w-[566px] flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
          overflow: "hidden",
        }}
      ></div>
    </div>
  );
}

function ContributionsUnavailableCard() {
  return (
    <div className="flex xl:w-auto xl:items-start xl:justify-center">
      <div className="bg-black/50 rounded-xl relative h-[270px] mr-0 sm:mx-4 w-[566px] min-w-[566px] flex items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">
          The contribution graph can't be loaded right now. Please try again in a few minutes.
        </p>
      </div>
    </div>
  );
}

function MenuLoadingCard() {
  return (
    <Card className="animate-pulse w-full sm:w-[448px] h-auto sm:h-[460px] min-h-[400px] flex flex-col">
      <div className="flex-1" />
    </Card>
  );
}

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};
