"use server";

import { authOptions } from "@/lib/auth";
import { AvailableThemeNames } from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";
import { RefreshInterval, db } from "@gitshow/db";

export async function initAction() {}

export async function setUpdateInterval(interval: RefreshInterval) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user.email ||
    (session.user && session.user.githubAuthenticated === false) ||
    (session.user && session.user.twitterAuthenticated === false)
  )
    redirect("/");

  const user = await db
    .selectFrom("user")
    .where("email", "=", session.user.email)
    .selectAll()
    .executeTakeFirstOrThrow();

  await db
    .updateTable("user")
    .where("id", "=", user.id)
    .set({ updateInterval: interval })
    .execute();

  await db.insertInto("jobQueue").values({ userId: user.id }).execute();

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
    redirect("/");

  const user = await db
    .selectFrom("user")
    .where("email", "=", session.user.email)
    .selectAll()
    .executeTakeFirstOrThrow();

  await db
    .updateTable("user")
    .where("id", "=", user.id)
    .set({ theme: theme })
    .execute();

  await db.insertInto("jobQueue").values({ userId: user.id }).execute();

  session.user.theme = theme;

  revalidateTag(user.githubUsername ?? "torvalds");
}

export async function setAutomaticallyUpdate(update: boolean) {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user.email ||
    (session.user && session.user.githubAuthenticated === false) ||
    (session.user && session.user.twitterAuthenticated === false)
  )
    redirect("/");

  const user = await db
    .selectFrom("user")
    .where("email", "=", session.user.email)
    .selectAll()
    .executeTakeFirstOrThrow();

  await db
    .updateTable("user")
    .where("id", "=", user.id)
    .set({ automaticallyUpdate: update })
    .execute();

  await db.insertInto("jobQueue").values({ userId: user.id }).execute();

  revalidateTag(user.githubUsername ?? "torvalds");
}

export async function deleteAccount() {
  "use server";
  
  const session = await getServerSession(authOptions);

  if (!session || !session.user.email) redirect("/");

  // Delete all job queue entries for this user
  await db.deleteFrom("jobQueue").where("email", "=", session.user.email).execute();
  
  // Delete the user account
  await db.deleteFrom("user").where("email", "=", session.user.email).execute();
}
