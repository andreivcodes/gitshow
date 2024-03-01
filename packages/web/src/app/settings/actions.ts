"use server";

import { authOptions } from "@/lib/auth";
import { queueJob } from "@/lib/sqs";
import { AvailableThemeNames, PREMIUM_INTERVALS, PREMIUM_THEMES, RefreshInterval, SubscriptionPlan, db } from "@gitshow/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function initAction() { }

export async function setUpdateInterval(interval: RefreshInterval) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user.email ||
    (session.user && session.user.githubAuthenticated === false) ||
    (session.user && session.user.twitterAuthenticated === false)
  )
    redirect("/signin");

  const user = await db.selectFrom("user").selectAll().where("email", "=", session.user.email!).executeTakeFirstOrThrow();

  if (
    PREMIUM_INTERVALS.includes(interval) &&
    user.subscriptionPlan != SubscriptionPlan.PREMIUM
  )
    redirect("/subscribe");


  await db.updateTable("user")
    .where("email", "=", session.user.email)
    .set({ updateInterval: interval }).execute();


  await queueJob(session.user.email, false);

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

  const user = await db.selectFrom("user").selectAll().where("email", "=", session.user.email).executeTakeFirstOrThrow();

  if (
    PREMIUM_THEMES.includes(theme) &&
    user.subscriptionPlan != SubscriptionPlan.PREMIUM
  )
    redirect("/subscribe");

  await db.updateTable("user").where("email", "=", session.user.email).set({ theme: theme }).execute();

  await queueJob(session.user.email, false);

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

  await db.updateTable("user").where("email", "=", session.user.email).set({ automaticallyUpdate: update }).execute();

  if (update) await queueJob(session.user.email, false);

  session.user.automaticallyUpdate = update;
}
