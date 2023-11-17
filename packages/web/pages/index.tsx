import Head from "next/head";
import { Suspense } from "react";
import ContributionsChart from "../components/contributions-chart";
import { Header } from "../components/header";
import { Menu } from "../components/menu";
import { Footer } from "../components/site-footer";
import { getServerAuthSession } from "../server/auth";
import { GetServerSideProps } from "next";
import {
  AvailableSubscriptionTypes,
  AvailableThemeNames,
  contribSvg,
} from "@gitshow/svg-gen";

export default function Home({
  name,
  twittertag,
  picture,
  svg,
  signedIn,
  storedSubscriptionType,
}: {
  name: string;
  twittertag: string;
  picture: string;
  svg: string;
  signedIn: boolean;
  storedSubscriptionType: AvailableSubscriptionTypes;
}) {
  return (
    <>
      <Head>
        <title>git.show</title>
        <meta name="description" content="show off your contributions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="orb-container w-full flex flex-col min-h-screen place-content-between xl:max-h-screen">
          <div className="orb" />
          <div className="flex flex-col gap-12 items-center">
            <Header />
            <div className="flex flex-col justify-center 2xl:flex-row 2xl:items-start 2xl:pt-20 w-full 2xl:w-3/4 gap-4 2xl:gap-8">
              <div className="flex flex-col justify-center 2xl:justify-end gap-10 2xl:pb-0">
                <ContributionsChart
                  name={name}
                  twittertag={twittertag}
                  picture={picture}
                  svg={svg}
                />
              </div>
              <Menu
                signedIn={signedIn}
                storedSubscriptionType={storedSubscriptionType}
              />
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}

export const getServerSideProps = (async (context) => {
  const session = await getServerAuthSession(context);
  let { type, theme } = context.query;

  const svg = await contribSvg(
    session?.user.githubname ?? "torvalds",
    (theme as AvailableThemeNames) ?? session?.user.theme ?? "classic",
    (type as AvailableSubscriptionTypes) ??
      session?.user.subscription_type ??
      "free"
  );

  return {
    props: {
      name: session?.user.twittername ?? "Linus Torvalds",
      picture: session?.user.twitterimage ?? "/linus.jpeg",
      twittertag: session?.user.twittertag ?? "@Linus__Torvalds",
      svg: svg,
      signedIn:
        session?.user.githubAuthenticated == true &&
        session?.user.twitterAuthenticated == true,
      storedSubscriptionType: session?.user.subscription_type ?? "none",
    },
  };
}) satisfies GetServerSideProps;
