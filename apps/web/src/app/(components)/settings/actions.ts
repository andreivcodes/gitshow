"use server";

import { authOptions } from "@/lib/auth";
import { AvailableThemeNames } from "@gitshow/gitshow-lib";
import { RefreshInterval } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";

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

  const user = await prisma.user.findFirstOrThrow({
    where: { email: session.user.email },
  });

  await prisma.user.update({
    where: { email: session.user.email },
    data: { updateInterval: interval },
  });

  await prisma.queue.create({
    data: { userId: user.id },
  });

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

  const user = await prisma.user.findFirstOrThrow({
    where: { email: session.user.email },
  });

  await prisma.user.update({
    where: { email: session.user.email },
    data: { theme: theme },
  });

  await prisma.queue.create({
    data: { userId: user.id },
  });

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

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { automaticallyUpdate: update },
  });

  await prisma.queue.create({
    data: { userId: user.id },
  });

  session.user.automaticallyUpdate = update;

  revalidateTag(user.githubUsername ?? "torvalds");
}

export async function deleteAccount() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.email) redirect("/");

  await prisma.user.delete({
    where: { email: session.user.email },
  });
}
