"use server";

import { authOptions } from "@/lib/auth";
import { AvailableThemeNames } from "@gitshow/gitshow-lib";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { RefreshInterval, db } from "@gitshow/db";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function initAction() {}

export async function setUpdateInterval(interval: RefreshInterval): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user.email ||
      (session.user && session.user.githubAuthenticated === false) ||
      (session.user && session.user.twitterAuthenticated === false)
    ) {
      return { success: false, error: "Not authenticated" };
    }

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

    updateTag("contributions");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update interval:", error);
    return {
      success: false,
      error: "Failed to update interval. Please try again."
    };
  }
}

export async function setUserTheme(theme: AvailableThemeNames): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user.email ||
      (session.user && session.user.githubAuthenticated === false) ||
      (session.user && session.user.twitterAuthenticated === false)
    ) {
      return { success: false, error: "Not authenticated" };
    }

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

    updateTag("contributions");
    updateTag(`user-${user.githubUsername ?? "torvalds"}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update theme:", error);
    return {
      success: false,
      error: "Failed to update theme. Please try again."
    };
  }
}

export async function setAutomaticallyUpdate(update: boolean): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !session.user.email ||
      (session.user && session.user.githubAuthenticated === false) ||
      (session.user && session.user.twitterAuthenticated === false)
    ) {
      return { success: false, error: "Not authenticated" };
    }

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

    updateTag(`user-${user.githubUsername ?? "torvalds"}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update auto-update setting:", error);
    return {
      success: false,
      error: "Failed to update setting. Please try again."
    };
  }
}

export async function deleteAccount(): Promise<ActionResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user.email) {
      return { success: false, error: "Not authenticated" };
    }

    // Get the user to find their ID
    const user = await db
      .selectFrom("user")
      .where("email", "=", session.user.email)
      .select("id")
      .executeTakeFirst();

    if (user) {
      // Delete all job queue entries for this user
      await db.deleteFrom("jobQueue").where("userId", "=", user.id).execute();
    }

    // Delete the user account
    await db.deleteFrom("user").where("email", "=", session.user.email).execute();

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return {
      success: false,
      error: "Failed to delete account. Please try again."
    };
  }
}
