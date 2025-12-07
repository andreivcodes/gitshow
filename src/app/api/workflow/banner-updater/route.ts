import { start, getRun } from "workflow/api";
import { bannerUpdaterLoop } from "@/workflows/banner-updater";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Query params schema for GET request.
 */
const GetQuerySchema = z.object({
  runId: z.string().min(1).optional(),
});

/**
 * GET: Check the status of a workflow run.
 * Query params:
 * - runId: The ID of the workflow run to check
 *
 * If no runId is provided, returns information about how to use the API.
 */
export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = GetQuerySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { runId } = parsed.data;

  if (!runId) {
    return NextResponse.json({
      message: "Banner updater workflow API",
      usage: {
        start: "POST /api/workflow/banner-updater",
        status: "GET /api/workflow/banner-updater?runId=<runId>",
      },
    });
  }

  try {
    const run = getRun(runId);
    const status = await run.status;

    return NextResponse.json({
      runId,
      status,
    });
  } catch (error) {
    console.error("[BannerUpdater API] Failed to get workflow status:", error);
    return NextResponse.json({ error: "Failed to get workflow status", runId }, { status: 500 });
  }
}

/**
 * POST: Start the banner updater workflow.
 * This should be called once after deployment.
 * The workflow runs forever with 1-hour sleep intervals.
 *
 * Note: If the workflow is already running, starting a new one will create
 * a duplicate. Consider tracking the runId and checking status before starting.
 */
export async function POST() {
  try {
    const run = await start(bannerUpdaterLoop, []);

    return NextResponse.json({
      message: "Banner updater workflow started",
      runId: run.runId,
      status: await run.status,
      note: "Save the runId to check status later via GET ?runId=<runId>",
    });
  } catch (error) {
    console.error("[BannerUpdater API] Failed to start workflow:", error);
    return NextResponse.json({ error: "Failed to start workflow" }, { status: 500 });
  }
}
