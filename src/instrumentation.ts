export async function register() {
  if (process.env.NEXT_RUNTIME !== "edge") {
    console.log("[Workflow] Starting Local World...");
    const { getWorld } = await import("workflow/runtime");
    await getWorld().start?.();
    console.log("[Workflow] Local World started");

    // Wait for workflow directive discovery to complete before starting workflows.
    // The discovery process runs asynchronously and takes ~1 second to finish.
    await new Promise((resolve) => setTimeout(resolve, 2000));

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
