import "server-only";

import { getRun, start } from "workflow/api";
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
