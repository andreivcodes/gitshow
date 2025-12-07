export async function register() {
  if (process.env.NEXT_RUNTIME !== "edge") {
    console.log("[Workflow] Starting Local World...");
    const { getWorld } = await import("workflow/runtime");
    await getWorld().start?.();
    console.log("[Workflow] Local World started");

    // Auto-start the banner updater workflow
    // Note: This will start a new workflow on each deployment.
    // The old workflow (if still running) will continue until it completes its current cycle.
    try {
      const { start } = await import("workflow/api");
      const { bannerUpdaterLoop } = await import("@/workflows/banner-updater");

      const run = await start(bannerUpdaterLoop, []);
      console.log(`[Workflow] Banner updater workflow started with runId: ${run.runId}`);
    } catch (error) {
      console.error("[Workflow] Failed to auto-start banner updater workflow:", error);
    }
  }
}
