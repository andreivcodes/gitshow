import "server-only";

import { getRun, start } from "workflow/api";
import { getWorld } from "workflow/runtime";
import { bannerUpdaterLoop } from "@/workflows/banner-updater";

type BannerUpdaterRunInfo = {
  runId: string;
  status: string;
};

type BannerUpdaterState = {
  runId: string | null;
  startPromise: Promise<BannerUpdaterRunInfo> | null;
};

const ACTIVE_STATUSES = new Set(["pending", "running", "paused", "pending_steps"]);

function getState(): BannerUpdaterState {
  const globalWithState = globalThis as typeof globalThis & {
    __bannerUpdaterState?: BannerUpdaterState;
  };

  if (!globalWithState.__bannerUpdaterState) {
    globalWithState.__bannerUpdaterState = { runId: null, startPromise: null };
  }

  return globalWithState.__bannerUpdaterState;
}

async function getRunStatus(runId: string): Promise<BannerUpdaterRunInfo | null> {
  try {
    const run = getRun(runId);
    const status = await run.status;
    return { runId, status };
  } catch {
    return null;
  }
}

function isActiveStatus(status: string): boolean {
  return ACTIVE_STATUSES.has(status);
}

/**
 * Finds a banner updater run that is already active in the world's storage.
 *
 * The in-memory runId is lost when the process restarts, but the Local World
 * data dir is not (same container) and `world.start()` re-enqueues every
 * pending/running run. Starting another one here would leave two loops
 * updating every banner, one more per restart. Adopt the newest active run
 * and cancel any older duplicates instead.
 */
async function adoptActiveRun(): Promise<BannerUpdaterRunInfo | null> {
  const workflowName = (bannerUpdaterLoop as { workflowId?: string }).workflowId;
  if (!workflowName) {
    return null;
  }

  const world = getWorld();
  const active: { runId: string; status: string; createdAt: Date }[] = [];
  for (const status of ["pending", "running"] as const) {
    let cursor: string | undefined;
    do {
      const page = await world.runs.list({
        workflowName,
        status,
        resolveData: "none",
        pagination: { cursor },
      });
      for (const run of page.data) {
        active.push({ runId: run.runId, status: run.status, createdAt: new Date(run.createdAt) });
      }
      cursor = page.hasMore ? (page.cursor ?? undefined) : undefined;
    } while (cursor);
  }

  if (active.length === 0) {
    return null;
  }

  active.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const [newest, ...duplicates] = active;

  for (const duplicate of duplicates) {
    try {
      await getRun(duplicate.runId).cancel();
      console.log(`[Workflow] Cancelled duplicate banner updater run ${duplicate.runId}`);
    } catch (error) {
      console.error(`[Workflow] Failed to cancel duplicate run ${duplicate.runId}:`, error);
    }
  }

  return { runId: newest.runId, status: newest.status };
}

export async function ensureBannerUpdaterStarted(): Promise<BannerUpdaterRunInfo> {
  const state = getState();

  if (state.startPromise) {
    return state.startPromise;
  }

  state.startPromise = (async () => {
    if (state.runId) {
      const existing = await getRunStatus(state.runId);
      if (existing && isActiveStatus(existing.status)) {
        return existing;
      }
    }

    const adopted = await adoptActiveRun();
    if (adopted) {
      state.runId = adopted.runId;
      return adopted;
    }

    const run = await start(bannerUpdaterLoop, []);
    const status = await run.status;
    state.runId = run.runId;

    return { runId: run.runId, status };
  })();

  try {
    return await state.startPromise;
  } finally {
    state.startPromise = null;
  }
}

export async function getBannerUpdaterStatus(runId?: string): Promise<BannerUpdaterRunInfo | null> {
  const state = getState();
  const resolvedRunId = runId ?? state.runId;
  if (!resolvedRunId) {
    return null;
  }

  return getRunStatus(resolvedRunId);
}
