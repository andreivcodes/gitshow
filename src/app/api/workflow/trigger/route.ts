import { start } from "workflow/api";
import { bannerUpdaterLoop } from "@/workflows/banner-updater";
import { NextResponse } from "next/server";

// Static import ensures workflow gets compiled by the Workflow DevKit
export async function POST() {
  const run = await start(bannerUpdaterLoop, []);
  return NextResponse.json({ runId: run.runId, status: await run.status });
}
