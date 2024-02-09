"use server";

import { authOptions } from "@/lib/auth";
import { queueJob } from "@/lib/sqs";
import { db, userTable, eq, takeUniqueOrNull } from "@gitshow/db";
import {
  AvailableThemeNames,
  UpdateIntervalsType,
  PREMIUM_THEMES,
  Plans,
  PremiumIntervals,
} from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function setUpdateInterval(interval: UpdateIntervalsType) {
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
    PremiumIntervals.includes(interval) &&
    user.subscriptionType != Plans.PREMIUM_PLAN
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
    user.subscriptionType != Plans.PREMIUM_PLAN
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

  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, session.user.email!))
    .then(takeUniqueOrNull);

  await db
    .update(userTable)
    .set({ automaticallyUpdate: update })
    .where(eq(userTable.email, session.user.email));

  await queueJob(session.user.email);

  redirect("/settings");
}
