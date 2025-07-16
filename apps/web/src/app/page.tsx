import React, { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { contribSvg } from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth/next";
import SignIn from "@/components/app/signin/signin";
import Settings from "@/components/app/settings/settings";
import Contributions from "@/components/app/contributions";
import { unstable_cache } from "next/cache";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex w-full flex-col gap-8 p-0 sm:p-4 xl:grid xl:grid-cols-2 xl:gap-8 xl:p-24 sm:overflow-x-clip">
      <div className="xl:flex xl:items-center xl:justify-center">
        <Suspense fallback={<ContributionsLoadingCard />}>
          <ContribsWrapper />
        </Suspense>
      </div>
      <div className="px-4 sm:px-0 xl:flex xl:items-center xl:justify-center">
        <Suspense fallback={<MenuLoadingCard />}>
          <MenuWrapper />
        </Suspense>
      </div>
    </div>
  );
}

async function ContribsWrapper() {
  const session = await getServerSession(authOptions);
  const getCachedSvg = unstable_cache(
    async (githubUsername, theme) => {
      try {
        return await contribSvg(githubUsername, theme);
      } catch (error) {
        console.error("Error fetching SVG:", error);
        return null;
      }
    },
    [session?.user.githubname ?? "torvalds"],
    { revalidate: 60 * 60 },
  );

  const svg = await getCachedSvg(
    session?.user.githubname ?? "torvalds",
    session?.user.theme ?? "githubDark",
  );

  if (!svg) {
    return <ContributionsLoadingCard />;
  }

  return (
    <div className="w-full xl:w-auto flex xl:items-center xl:justify-center">
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
  const session = await getServerSession(authOptions);
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
    <div className="w-full xl:w-auto flex xl:items-center xl:justify-center">
      <div
        className="animate-pulse bg-black/50 rounded-xl relative h-[270px] ml-4 mr-0 sm:mx-4 w-[566px] flex items-center justify-center"
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
