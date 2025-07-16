import React, { Suspense } from "react";
import { authOptions } from "@/lib/auth";
import { contribSvg } from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth/next";
import SignIn from "@/components/app/signin/signin";
import Settings from "@/components/app/settings/settings";
import Contributions from "@/components/app/contributions";
import { unstable_cache } from "next/cache";

export default function Home() {
  return (
    <div className="flex w-full flex-col justify-around gap-8 p-4 xl:flex-row xl:p-24">
      <Suspense fallback={<LoadingCard />}>
        <ContribsWrapper />
      </Suspense>
      <Suspense fallback={<LoadingCard />}>
        <MenuWrapper />
      </Suspense>
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
    return <LoadingCard />;
  }

  return (
    <div className="w-full xl:w-fit flex xl:items-center xl:justify-center">
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

function LoadingCard() {
  return (
    <div
      className="animate-pulse bg-card border-stone-800 border-2 bg-opacity-20 text-opacity-25 text-card-foreground rounded-lg relative h-[16em] mx-4 w-[500px] 2xl:w-[30em] min-w-[500px] flex items-center justify-center"
      style={{
        transformStyle: "preserve-3d",
        overflow: "hidden",
      }}
    ></div>
  );
}
