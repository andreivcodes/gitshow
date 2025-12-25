export async function register() {
  if (process.env.NEXT_RUNTIME !== "edge") {
    console.log("[Workflow] Starting Local World...");
    const { getWorld } = await import("workflow/runtime");
    await getWorld().start?.();
    console.log("[Workflow] Local World started");

    // Auto-start the banner updater workflow if one isn't already active in this instance.
    try {
      const { ensureBannerUpdaterStarted } = await import("@/lib/workflows/banner-updater-control");
      const runInfo = await ensureBannerUpdaterStarted();
      console.log(
        `[Workflow] Banner updater workflow ${runInfo.status} with runId: ${runInfo.runId}`
      );
    } catch (error) {
      console.error("[Workflow] Failed to auto-start banner updater workflow:", error);
    }
  }
}
