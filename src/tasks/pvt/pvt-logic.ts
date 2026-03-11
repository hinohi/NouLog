import type { PVTResult, PVTTrial } from "../../db/schema.ts";

export const PVT_DURATION_MS = 180_000;
export const PVT_ISI_MIN = 2_000;
export const PVT_ISI_MAX = 10_000;
export const PVT_LAPSE_THRESHOLD = 500;

export function randomISI(): number {
  return (
    Math.floor(Math.random() * (PVT_ISI_MAX - PVT_ISI_MIN + 1)) + PVT_ISI_MIN
  );
}

export function computeMetrics(
  trials: PVTTrial[],
  durationMs: number,
): PVTResult {
  const validTrials = trials.filter((t) => !t.falseStart);
  const rts = validTrials.map((t) => t.rt);
  const sorted = [...rts].sort((a, b) => a - b);

  const meanRT =
    rts.length > 0
      ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length)
      : 0;

  let medianRT = 0;
  if (sorted.length > 0) {
    const mid = Math.floor(sorted.length / 2);
    medianRT =
      sorted.length % 2 === 0
        ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
        : sorted[mid]!;
  }

  return {
    timestamp: Date.now(),
    durationMs,
    trials,
    meanRT,
    medianRT,
    lapseCount: rts.filter((rt) => rt > PVT_LAPSE_THRESHOLD).length,
    falseStartCount: trials.filter((t) => t.falseStart).length,
    validTrialCount: validTrials.length,
  };
}
