/**
 * Shared Zod schemas with inferred types.
 *
 * Best practices followed:
 * - Single source of truth: schemas define types, not the other way around
 * - Use z.infer<> for type extraction
 * - Export both schema and inferred type together
 * - Use safeParse for error handling without exceptions
 */

import { z } from "zod";

// =============================================================================
// Enums
// =============================================================================

/**
 * Available theme names for contribution graphs.
 * This is derived from the themes object keys in contributions/themes.ts
 */
export const ThemeNameSchema = z.enum([
  "normal",
  "classic",
  "githubDark",
  "dracula",
  "bnw",
  "spooky",
  "winter",
  "christmas",
  "ocean",
  "sunset",
  "forest",
  "neon",
  "candy",
  "fire",
]);

export type ThemeName = z.infer<typeof ThemeNameSchema>;

/**
 * Display names for themes.
 * Used in UI components like theme selectors.
 */
export const themeDisplayNames: Record<ThemeName, string> = {
  normal: "Normal",
  classic: "Classic",
  githubDark: "GitHub Dark",
  dracula: "Dracula",
  bnw: "Black and White",
  spooky: "Spooky",
  winter: "Winter",
  christmas: "Christmas",
  ocean: "Ocean",
  sunset: "Sunset",
  forest: "Forest",
  neon: "Neon",
  candy: "Candy",
  fire: "Fire",
};

/**
 * Get all theme names as an array for iteration.
 */
export const themeNames = ThemeNameSchema.options;

/**
 * Refresh interval for automatic banner updates.
 */
export const RefreshIntervalSchema = z.enum(["EVERY_DAY", "EVERY_WEEK", "EVERY_MONTH"]);

export type RefreshInterval = z.infer<typeof RefreshIntervalSchema>;

/**
 * RefreshInterval as an enum-like object for backwards compatibility.
 * Allows usage like: RefreshInterval.EVERY_DAY
 */
export const RefreshInterval = {
  EVERY_DAY: "EVERY_DAY",
  EVERY_WEEK: "EVERY_WEEK",
  EVERY_MONTH: "EVERY_MONTH",
} as const satisfies Record<RefreshInterval, RefreshInterval>;

/**
 * Display names for refresh intervals.
 * Used in UI components like interval selectors.
 */
export const refreshIntervalDisplayNames: Record<RefreshInterval, string> = {
  EVERY_DAY: "Daily",
  EVERY_WEEK: "Weekly",
  EVERY_MONTH: "Monthly",
};

/**
 * Get all refresh interval values as an array for iteration.
 */
export const refreshIntervalValues = RefreshIntervalSchema.options;

// =============================================================================
// Contribution Data
// =============================================================================

/**
 * Single day contribution data from GitHub.
 */
export const ContributionDaySchema = z.object({
  date: z.string(), // ISO date string YYYY-MM-DD
  level: z.string(), // "0" | "1" | "2" | "3" | "4"
});

export type ContributionDay = z.infer<typeof ContributionDaySchema>;

/**
 * Full contribution data structure from GitHub scraping.
 */
export const ContributionDataSchema = z.object({
  total: z.number().int().nonnegative(),
  range: z.object({
    start: z.string(), // ISO date string
    end: z.string(), // ISO date string
  }),
  contributions: z.array(ContributionDaySchema),
});

export type ContributionData = z.infer<typeof ContributionDataSchema>;

/**
 * Theme color definition.
 */
export const ThemeSchema = z.object({
  background: z.string(),
  text: z.string(),
  level4: z.string(),
  level3: z.string(),
  level2: z.string(),
  level1: z.string(),
  level0: z.string(),
});

export type Theme = z.infer<typeof ThemeSchema>;

// =============================================================================
// Scraper Configuration
// =============================================================================

/**
 * Configuration for the GitHub contribution scraper.
 */
export const ScraperConfigSchema = z.object({
  browserlessUrl: z.string().url(),
  browserlessToken: z.string().min(1),
  maxRetries: z.number().int().positive().optional(),
  retryDelayMs: z.number().int().positive().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

export type ScraperConfig = z.infer<typeof ScraperConfigSchema>;

// =============================================================================
// Server Action Results
// =============================================================================

/**
 * Generic action result for server actions.
 * Uses discriminated union for type-safe success/error handling.
 */
export const ActionResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.discriminatedUnion("success", [
    z.object({
      success: z.literal(true),
      data: dataSchema,
    }),
    z.object({
      success: z.literal(false),
      error: z.string(),
    }),
  ]);

// Simple void action result (most common case)
export const VoidActionResultSchema = ActionResultSchema(z.undefined());
export type VoidActionResult = z.infer<typeof VoidActionResultSchema>;

// =============================================================================
// Server Action Input Schemas
// =============================================================================

/**
 * Input for setUserTheme action.
 */
export const SetThemeInputSchema = z.object({
  theme: ThemeNameSchema,
});

export type SetThemeInput = z.infer<typeof SetThemeInputSchema>;

/**
 * Input for setUpdateInterval action.
 */
export const SetUpdateIntervalInputSchema = z.object({
  interval: RefreshIntervalSchema,
});

export type SetUpdateIntervalInput = z.infer<typeof SetUpdateIntervalInputSchema>;

/**
 * Input for setAutomaticallyUpdate action.
 */
export const SetAutomaticallyUpdateInputSchema = z.object({
  enabled: z.boolean(),
});

export type SetAutomaticallyUpdateInput = z.infer<typeof SetAutomaticallyUpdateInputSchema>;

// =============================================================================
// API Route Schemas
// =============================================================================

/**
 * Query params for workflow status check.
 */
export const WorkflowStatusQuerySchema = z.object({
  runId: z.string().min(1).optional(),
});

export type WorkflowStatusQuery = z.infer<typeof WorkflowStatusQuerySchema>;

// =============================================================================
// Validation Helpers
// =============================================================================

/**
 * Safe parse helper that returns a typed result.
 * Use this in server actions for consistent error handling.
 */
export function safeParseInput<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  // Format first error message for user display (Zod 4 uses .issues, not .errors)
  const firstIssue = result.error.issues[0];
  const path = firstIssue.path.length > 0 ? `${firstIssue.path.join(".")}: ` : "";
  return { success: false, error: `${path}${firstIssue.message}` };
}
