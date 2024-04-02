"use server";

import { authOptions } from "@/lib/auth";
import { AvailableThemeNames, PREMIUM_INTERVALS, PREMIUM_THEMES } from "@gitshow/gitshow-lib";
import { RefreshInterval, SubscriptionPlan } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { QUEUE_NAME, Rabbit_Message, prisma, rbmq_ch } from "@/lib/db";
import amqplib from "amqplib";

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

  const message: Rabbit_Message = {
    userId: user.id,
  };

  rbmq_ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));

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

  const message: Rabbit_Message = {
    userId: user.id,
  };

  rbmq_ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));

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

  const message: Rabbit_Message = {
    userId: user.id,
  };

  rbmq_ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)));

  session.user.automaticallyUpdate = update;
}
