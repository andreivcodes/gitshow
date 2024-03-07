"use server";

import { authOptions } from "@/lib/auth";
import { AvailableThemeNames, PREMIUM_INTERVALS, PREMIUM_THEMES } from "@gitshow/gitshow-lib";
import { RefreshInterval, SubscriptionPlan } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma, redis } from "@/lib/db";

export async function initAction() {}

export async function setUpdateInterval(interval: RefreshInterval) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user.email ||
    (session.user && session.user.githubAuthenticated === false) ||
    (session.user && session.user.twitterAuthenticated === false)
  )
    redirect("/signin");

  const user = await prisma.user.findFirstOrThrow({ where: { email: session.user.email } });

  if (PREMIUM_INTERVALS.includes(interval) && user.subscriptionPlan != SubscriptionPlan.PREMIUM) redirect("/subscribe");

  await prisma.user.update({ where: { email: session.user.email }, data: { updateInterval: interval } });

  await redis.publish("update", JSON.stringify({ userId: user.id }));

  session.user.updateInterval = interval;
}

export async function setUserTheme(theme: AvailableThemeNames) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user.email ||
    (session.user && session.user.githubAuthenticated === false) ||
    (session.user && session.user.twitterAuthenticated === false)
  )
    redirect("/signin");

  const user = await prisma.user.findFirstOrThrow({ where: { email: session.user.email } });

  if (PREMIUM_THEMES.includes(theme) && user.subscriptionPlan != SubscriptionPlan.PREMIUM) redirect("/subscribe");

  await prisma.user.update({ where: { email: session.user.email }, data: { theme: theme } });

  await redis.publish("update", JSON.stringify({ userId: user.id }));

  session.user.theme = theme;

  redirect("/settings");
}

export async function setAutomaticallyUpdate(update: boolean) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user.email ||
    (session.user && session.user.githubAuthenticated === false) ||
    (session.user && session.user.twitterAuthenticated === false)
  )
    redirect("/signin");

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { automaticallyUpdate: update },
  });

  if (update) await redis.publish("update", JSON.stringify({ userId: user.id }));

  session.user.automaticallyUpdate = update;
}
