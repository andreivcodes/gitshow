"use server";

import { authOptions } from "@/lib/auth";
import { queueJob } from "@/lib/sqs";
import { db, userTable, eq, takeUniqueOrNull } from "@gitshow/db";
import {
  AvailableThemeNames,
  PREMIUM_INTERVALS,
  PREMIUM_THEMES,
  SubscriptionPlan,
  UpdateInterval,
} from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function setUpdateInterval(interval: UpdateInterval) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user.email ||
    (session.user && session.user.githubAuthenticated === false) ||
    (session.user && session.user.twitterAuthenticated === false)
  )
    redirect("/signin");

  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, session.user.email!))
    .then(takeUniqueOrNull);

  if (
    PREMIUM_INTERVALS.includes(interval) &&
    user.subscriptionPlan != SubscriptionPlan.Premium
  )
    redirect("/subscribe");

  await db
    .update(userTable)
    .set({ updateInterval: interval })
    .where(eq(userTable.email, session.user.email));

  await queueJob(session.user.email);

  redirect("/settings");
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

  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, session.user.email!))
    .then(takeUniqueOrNull);

  if (
    PREMIUM_THEMES.includes(theme) &&
    user.subscriptionPlan != SubscriptionPlan.Premium
  )
    redirect("/subscribe");

  await db
    .update(userTable)
    .set({ theme: theme as AvailableThemeNames })
    .where(eq(userTable.email, session.user.email));

  await queueJob(session.user.email);

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

  await db
    .update(userTable)
    .set({ automaticallyUpdate: update })
    .where(eq(userTable.email, session.user.email));

  await queueJob(session.user.email);

  redirect("/settings");
}
