import React, { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import SignIn from "@/components/app/signin/signin";
import Settings from "@/components/app/settings/settings";
import Contributions from "@/components/app/contributions";
import { getCachedContributionSvg } from "@/lib/cache/contributions-cache";
import { Card } from "@/components/ui/card";

export default async function Home() {
  // Fetch session ONCE at page level to avoid duplicate calls
  const session = await getServerSession(authOptions);

  return (
    <div className="flex w-full flex-col gap-8 p-4 xl:grid xl:grid-cols-2 xl:gap-8 xl:p-24 overflow-x-visible sm:overflow-x-clip">
      <div className="xl:flex xl:items-start xl:justify-center">
        <Suspense fallback={<ContributionsLoadingCard />}>
          <ContribsWrapper session={session} />
        </Suspense>
      </div>
      <div className="xl:flex xl:items-start xl:justify-center">
        <Suspense fallback={<MenuLoadingCard />}>
          <MenuWrapper session={session} />
        </Suspense>
      </div>
    </div>
  );
}

async function ContribsWrapper({ session }: { session: Session | null }) {
  const svg = await getCachedContributionSvg(
    session?.user.githubname ?? "torvalds",
    session?.user.theme ?? "githubDark"
  );

  if (!svg) {
    return <ContributionsLoadingCard />;
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

async function MenuWrapper({ session }: { session: Session | null }) {
  return session &&
    session.user.twitterAuthenticated &&
    session.user.githubAuthenticated ? (
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

function MenuLoadingCard() {
  return (
    <Card className="animate-pulse w-full sm:w-[448px] h-auto sm:h-[460px] min-h-[400px] flex flex-col">
      <div className="flex-1" />
    </Card>
  );
}
