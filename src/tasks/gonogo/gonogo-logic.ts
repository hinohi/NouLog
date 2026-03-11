import type { GoNogoResult, GoNogoTrial } from "../../db/schema.ts";

export const GONOGO_TOTAL_TRIALS = 80;
export const GONOGO_GO_COUNT = 60;
export const GONOGO_NOGO_COUNT = 20;
export const GONOGO_STIMULUS_TIMEOUT_MS = 1500;
export const GONOGO_ISI_MIN = 1000;
export const GONOGO_ISI_MAX = 2000;

export function randomISI(): number {
  return (
    Math.floor(Math.random() * (GONOGO_ISI_MAX - GONOGO_ISI_MIN + 1)) +
    GONOGO_ISI_MIN
  );
}

export function generateTrialSequence(): ("go" | "nogo")[] {
  const seq: ("go" | "nogo")[] = [
    ...Array<"go">(GONOGO_GO_COUNT).fill("go"),
    ...Array<"nogo">(GONOGO_NOGO_COUNT).fill("nogo"),
  ];
  // Fisher-Yates shuffle
  for (let i = seq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seq[i], seq[j]] = [seq[j]!, seq[i]!];
  }
  return seq;
}

/**
 * Approximate inverse normal CDF (probit function).
 * Uses Abramowitz & Stegun rational approximation (formula 26.2.23).
 */
export function zScore(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error("p must be between 0 and 1 exclusive");
  }
  // Rational approximation constants
  const a1 = -3.969683028665376e1;
  const a2 = 2.209460984245205e2;
  const a3 = -2.759285104469687e2;
  const a4 = 1.38357751867269e2;
  const a5 = -3.066479806614716e1;
  const a6 = 2.506628277459239;

  const b1 = -5.447609879822406e1;
  const b2 = 1.615858368580409e2;
  const b3 = -1.556989798598866e2;
  const b4 = 6.680131188771972e1;
  const b5 = -1.328068155288572e1;

  const c1 = -7.784894002430293e-3;
  const c2 = -3.223964580411365e-1;
  const c3 = -2.400758277161838;
  const c4 = -2.549732539343734;
  const c5 = 4.374664141464968;
  const c6 = 2.938163982698783;

  const d1 = 7.784695709041462e-3;
  const d2 = 3.224671290700398e-1;
  const d3 = 2.445134137142996;
  const d4 = 3.754408661907416;

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number;
  let r: number;
  let result: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    result =
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    result =
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    result =
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
      ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  return result;
}

/**
 * Compute d' with Hautus (1995) log-linear correction.
 * Adjusted rates: hitRate = (hits + 0.5) / (goCount + 1)
 *                 faRate  = (fa + 0.5) / (nogoCount + 1)
 */
export function computeDPrime(
  hits: number,
  falseAlarms: number,
  goCount: number,
  nogoCount: number,
): number {
  const adjustedHitRate = (hits + 0.5) / (goCount + 1);
  const adjustedFARate = (falseAlarms + 0.5) / (nogoCount + 1);
  return zScore(adjustedHitRate) - zScore(adjustedFARate);
}

export function computeGoNogoMetrics(
  trials: GoNogoTrial[],
  durationMs: number,
): GoNogoResult {
  const goTrials = trials.filter((t) => t.type === "go");
  const nogoTrials = trials.filter((t) => t.type === "nogo");

  const goHits = goTrials.filter((t) => t.responded);
  const falseAlarms = nogoTrials.filter((t) => t.responded);

  const goHitRate = goTrials.length > 0 ? goHits.length / goTrials.length : 0;
  const falseAlarmRate =
    nogoTrials.length > 0 ? falseAlarms.length / nogoTrials.length : 0;
  const omissionRate =
    goTrials.length > 0
      ? goTrials.filter((t) => !t.responded).length / goTrials.length
      : 0;

  const goRTs = goHits
    .map((t) => t.rt)
    .filter((rt): rt is number => rt !== null);
  const sortedRTs = [...goRTs].sort((a, b) => a - b);

  const goMeanRT =
    goRTs.length > 0
      ? Math.round(goRTs.reduce((a, b) => a + b, 0) / goRTs.length)
      : 0;

  let goMedianRT = 0;
  if (sortedRTs.length > 0) {
    const mid = Math.floor(sortedRTs.length / 2);
    goMedianRT =
      sortedRTs.length % 2 === 0
        ? Math.round((sortedRTs[mid - 1]! + sortedRTs[mid]!) / 2)
        : sortedRTs[mid]!;
  }

  const dPrime = computeDPrime(
    goHits.length,
    falseAlarms.length,
    goTrials.length,
    nogoTrials.length,
  );

  return {
    timestamp: Date.now(),
    durationMs,
    trials,
    dPrime: Math.round(dPrime * 100) / 100,
    goHitRate: Math.round(goHitRate * 1000) / 1000,
    goMeanRT,
    goMedianRT,
    falseAlarmRate: Math.round(falseAlarmRate * 1000) / 1000,
    omissionRate: Math.round(omissionRate * 1000) / 1000,
  };
}
