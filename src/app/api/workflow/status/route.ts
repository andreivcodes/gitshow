import { connection } from "next/server";
import { getBannerUpdaterStatus } from "@/lib/workflows/banner-updater-control";

// The Workflow DevKit only discovers "use workflow" / "use step" code reachable
// from app route/page/layout files. instrumentation.ts is not scanned, so this
// route's (transitive) import of bannerUpdaterLoop is what gets the workflow
// compiled into /.well-known/workflow/v1/*. Do not remove it without adding
// another route that imports the workflow.
//
// Read-only: reports the banner updater run started by instrumentation.ts.
// src/proxy.ts restricts /api/workflow/* to localhost.
export async function GET() {
  await connection();

  const run = await getBannerUpdaterStatus();
  return Response.json(run ?? { runId: null, status: "not_started" }, {
    headers: { "Cache-Control": "no-store" },
  });
}
