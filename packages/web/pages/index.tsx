import { GetServerSideProps } from "next";
import Head from "next/head";
import ContributionsChart from "../components/contributions-chart";
import { Header } from "../components/header";
import { Menu } from "../components/menu";
import { Footer } from "../components/site-footer";
import { getServerAuthSession } from "../server/auth";
import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  NONE_PLAN,
  AvailableSubscriptionTypes,
  AvailableThemeNames,
  contribSvg,
  AvailableIntervals,
} from "@gitshow/gitshow-lib";
import Feedback from "../components/feedback";
import { Card } from "../components/ui/card";

export const SubscriptionContext = createContext({
  subscriptionType: NONE_PLAN,
  setSubscriptionType: (subscriptionType: AvailableSubscriptionTypes) => {},
  theme: "classic",
  setTheme: (theme: AvailableThemeNames) => {},
  interval: 720,
  setInterval: (interval: AvailableIntervals) => {},
});

export default function Home({
  name,
  twittertag,
  picture,
  svg,
  fullyAuthenticated,
  storedSubscriptionType,
  storedTheme,
  storedInterval,
}: {
  name: string;
  twittertag: string;
  picture: string;
  svg: string;
  fullyAuthenticated: boolean;
  storedSubscriptionType: AvailableSubscriptionTypes;
  storedTheme: AvailableThemeNames;
  storedInterval: AvailableIntervals;
}) {
  const [subscriptionType, setSubscriptionType] = useState(
    storedSubscriptionType
  );
  const [theme, setTheme] = useState(storedTheme);
  const [interval, setInterval] = useState(storedInterval);

  const router = useRouter();

  useEffect(() => {
    router.replace(router.asPath);
  }, [theme]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionType,
        setSubscriptionType,
        theme,
        setTheme,
        interval,
        setInterval,
      }}
    >
      <Head>
        <title>git.show</title>
        <meta name="description" content="show off your contributions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="orb-container w-full flex flex-col min-h-screen place-content-between">
          <div className="absolute -bottom-2 -right-2 xl:-bottom-4 xl:-right-4">
            <Card>
              <div className="pb-4 pr-4 pt-2 pl-2 xl:pb-8 xl:pr-8 xl:pt-4 xl:pl-4">
                <Feedback />
              </div>
            </Card>
          </div>
          <div className="orb" />
          <div className="flex flex-col gap-12 items-center">
            <Header />
            <div className="flex flex-col justify-center 2xl:flex-row 2xl:items-start 2xl:pt-20 w-full 2xl:w-3/4 gap-8">
              <div className="flex flex-col justify-center 2xl:justify-end gap-10 2xl:pb-0">
                <ContributionsChart
                  name={name}
                  twittertag={twittertag}
                  picture={picture}
                  svg={svg}
                />
              </div>
              <Menu
                fullyAuthenticated={fullyAuthenticated}
                storedSubscriptionType={storedSubscriptionType}
              />
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </SubscriptionContext.Provider>
  );
}

export const getServerSideProps = (async (context) => {
  const session = await getServerAuthSession(context);

  const svg = await contribSvg(
    session?.user.githubname ?? "torvalds",
    session?.user.theme ?? "classic",
    session?.user.subscription_type ?? NONE_PLAN
  );

  return {
    props: {
      name: session?.user.twittername ?? "Linus Torvalds",
      picture: session?.user.twitterimage ?? "/linus.jpeg",
      twittertag: session?.user.twittertag ?? "@Linus__Torvalds",
      svg: svg,
      fullyAuthenticated: session?.user.fullyAuthenticated ?? false,
      storedSubscriptionType: session?.user.subscription_type ?? NONE_PLAN,
      storedTheme: session?.user.theme ?? "classic",
      storedInterval: session?.user.interval ?? 720,
    },
  };
}) satisfies GetServerSideProps;
