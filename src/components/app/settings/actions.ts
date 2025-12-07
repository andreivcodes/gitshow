"use server";

import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { updateTag } from "next/cache";
import { db } from "@/lib/db";
import {
  ThemeNameSchema,
  RefreshIntervalSchema,
  safeParseInput,
  type ThemeName,
  type RefreshInterval,
  type VoidActionResult,
} from "@/lib/schemas";
import { z } from "zod";

/**
 * Helper to check if user is fully authenticated.
 * Returns the authenticated session or an error result.
 */
type AuthResult = { success: true; session: Session } | { success: false; error: string };

async function requireFullAuth(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (
    !session ||
    !session.user.email ||
    session.user.githubAuthenticated === false ||
    session.user.twitterAuthenticated === false
  ) {
    return { success: false, error: "Not authenticated" };
  }

  return { success: true, session };
}

export async function initAction() {}

export async function setUpdateInterval(interval: RefreshInterval): Promise<VoidActionResult> {
  // Validate input with Zod
  const parsed = safeParseInput(RefreshIntervalSchema, interval);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const authResult = await requireFullAuth();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const { session } = authResult;

    const user = await db
      .selectFrom("user")
      .where("email", "=", session.user.email!)
      .selectAll()
      .executeTakeFirstOrThrow();

    await db
      .updateTable("user")
      .where("id", "=", user.id)
      .set({ updateInterval: parsed.data })
      .execute();

    session.user.updateInterval = parsed.data;

    updateTag("contributions");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update interval:", error);
    return {
      success: false,
      error: "Failed to update interval. Please try again.",
    };
  }
}

export async function setUserTheme(theme: ThemeName): Promise<VoidActionResult> {
  // Validate input with Zod
  const parsed = safeParseInput(ThemeNameSchema, theme);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const authResult = await requireFullAuth();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const { session } = authResult;

    const user = await db
      .selectFrom("user")
      .where("email", "=", session.user.email!)
      .selectAll()
      .executeTakeFirstOrThrow();

    await db.updateTable("user").where("id", "=", user.id).set({ theme: parsed.data }).execute();

    session.user.theme = parsed.data;

    updateTag("contributions");
    updateTag(`user-${user.githubUsername ?? "torvalds"}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update theme:", error);
    return {
      success: false,
      error: "Failed to update theme. Please try again.",
    };
  }
}

export async function setAutomaticallyUpdate(update: boolean): Promise<VoidActionResult> {
  // Validate input with Zod
  const parsed = safeParseInput(z.boolean(), update);
  if (!parsed.success) {
    return { success: false, error: parsed.error };
  }

  const authResult = await requireFullAuth();
  if (!authResult.success) {
    return authResult;
  }

  try {
    const { session } = authResult;

    const user = await db
      .selectFrom("user")
      .where("email", "=", session.user.email!)
      .selectAll()
      .executeTakeFirstOrThrow();

    await db
      .updateTable("user")
      .where("id", "=", user.id)
      .set({ automaticallyUpdate: parsed.data })
      .execute();

    updateTag(`user-${user.githubUsername ?? "torvalds"}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to update auto-update setting:", error);
    return {
      success: false,
      error: "Failed to update setting. Please try again.",
    };
  }
}

export async function deleteAccount(): Promise<VoidActionResult> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.email) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Delete the user account
    await db.deleteFrom("user").where("email", "=", session.user.email).execute();

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return {
      success: false,
      error: "Failed to delete account. Please try again.",
    };
  }
}
