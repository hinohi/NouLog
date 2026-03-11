import type { CorsiResult, CorsiTrial } from "../../db/schema.ts";

export const CORSI_BLOCK_COUNT = 9;
export const CORSI_INITIAL_SPAN = 2;
export const CORSI_MAX_SPAN = 9;
export const CORSI_TRIALS_PER_SPAN = 2;
export const CORSI_LIGHT_DURATION_MS = 1000;
export const CORSI_LIGHT_INTERVAL_MS = 500;

// 9 blocks in irregular positions (% units)
export const BLOCK_POSITIONS: { x: number; y: number }[] = [
  { x: 20, y: 15 },
  { x: 55, y: 10 },
  { x: 80, y: 25 },
  { x: 10, y: 45 },
  { x: 45, y: 40 },
  { x: 75, y: 55 },
  { x: 25, y: 70 },
  { x: 60, y: 75 },
  { x: 40, y: 90 },
];

export function generateSequence(spanLength: number): number[] {
  const indices = Array.from({ length: CORSI_BLOCK_COUNT }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  return indices.slice(0, spanLength);
}

export function checkSequence(expected: number[], actual: number[]): boolean {
  if (expected.length !== actual.length) return false;
  return expected.every((v, i) => v === actual[i]);
}

export function computeCorsiResult(
  trials: CorsiTrial[],
  durationMs: number,
): CorsiResult {
  const correctTrials = trials.filter((t) => t.correct);
  const blockSpan =
    correctTrials.length > 0
      ? Math.max(...correctTrials.map((t) => t.spanLength))
      : 0;
  const totalScore = correctTrials.reduce((sum, t) => sum + t.spanLength, 0);
  const longestSequence = blockSpan;

  return {
    uid: crypto.randomUUID(),
    timestamp: Date.now(),
    durationMs,
    trials,
    blockSpan,
    totalScore,
    longestSequence,
    totalTrials: trials.length,
    correctTrials: correctTrials.length,
  };
}
