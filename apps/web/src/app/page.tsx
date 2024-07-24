import React, { Suspense, lazy } from 'react';
import { authOptions } from "@/lib/auth";
import { contribSvg } from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth/next";
import SignIn from "./(components)/signin/signin";
import Settings from './(components)/settings/settings';
import Contributions from './(components)/contributions';
import { unstable_cache } from 'next/cache';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex w-full flex-col justify-around gap-8 p-4 xl:flex-row xl:p-24">
      <Suspense fallback={<LoadingContribs />}>
        <Contribs />
      </Suspense>
      <Suspense fallback={<LoadingContribs />}>
        {session && session.user.twitterAuthenticated && session.user.githubAuthenticated ? <Settings /> : <SignIn />}
      </Suspense>
    </div>
  );
}


async function Contribs() {
  const session = await getServerSession(authOptions);

  const getCachedSvg = unstable_cache(
    async (githubUsername, theme) => await contribSvg(
      githubUsername,
      theme
    ),
    [session?.user.githubname ?? "torvalds"],
    { revalidate: 60 * 60 }
  );

  const svg = await getCachedSvg(session?.user.githubname ?? "torvalds",
    session?.user.theme ?? "githubDark");

  return <Contributions
    name={session?.user.twittername ?? "Linus Torvalds"}
    twittertag={session?.user.twittertag ?? "@Linus__Torvalds"}
    picture={session?.user.twitterimage ?? "/linus.jpeg"}
    svg={svg}
  />
}


function LoadingContribs() {
  return (<div
    className="animate-pulse bg-card border-stone-800 border-2 bg-opacity-20 text-opacity-25 text-card-foreground rounded-lg relative h-[16em] mx-4 w-[500px] 2xl:w-[30em] min-w-[500px] flex items-center justify-center"
    style={{
      transformStyle: "preserve-3d",
      overflow: "hidden",
    }}
  >

  </div>)
}
