import type { TaskSwitchResult, TaskSwitchTrial } from "../../db/schema.ts";

export const TOTAL_TRIALS = 64;
export const PRACTICE_TRIALS = 4;
export const STIMULUS_TIMEOUT_MS = 3000;
export const FEEDBACK_MS = 500;
export const ISI_MS = 500;
export const DIGITS = [1, 2, 3, 4, 6, 7, 8, 9] as const;

export function getTaskForTrial(index: number): "parity" | "magnitude" {
  return index % 4 < 2 ? "parity" : "magnitude";
}

export function getTrialCondition(
  index: number,
): "switch" | "repeat" | "first" {
  if (index === 0) return "first";
  const currentTask = getTaskForTrial(index);
  const prevTask = getTaskForTrial(index - 1);
  return currentTask === prevTask ? "repeat" : "switch";
}

export function randomDigit(): number {
  return DIGITS[Math.floor(Math.random() * DIGITS.length)]!;
}

export function getCorrectResponse(
  task: "parity" | "magnitude",
  digit: number,
): "left" | "right" {
  if (task === "parity") {
    return digit % 2 === 1 ? "left" : "right";
  }
  return digit < 5 ? "left" : "right";
}

export function computeTaskSwitchMetrics(
  trials: TaskSwitchTrial[],
  durationMs: number,
): TaskSwitchResult {
  const analyzed = trials.slice(PRACTICE_TRIALS);

  const switchTrials = analyzed.filter((t) => t.condition === "switch");
  const repeatTrials = analyzed.filter((t) => t.condition === "repeat");

  const correctSwitchRTs = switchTrials
    .filter((t) => t.correct && t.rt !== null)
    .map((t) => t.rt!);
  const correctRepeatRTs = repeatTrials
    .filter((t) => t.correct && t.rt !== null)
    .map((t) => t.rt!);

  const switchMeanRT =
    correctSwitchRTs.length > 0
      ? Math.round(
          correctSwitchRTs.reduce((a, b) => a + b, 0) / correctSwitchRTs.length,
        )
      : 0;
  const repeatMeanRT =
    correctRepeatRTs.length > 0
      ? Math.round(
          correctRepeatRTs.reduce((a, b) => a + b, 0) / correctRepeatRTs.length,
        )
      : 0;

  const allCorrectRTs = [...correctSwitchRTs, ...correctRepeatRTs];
  const overallMeanRT =
    allCorrectRTs.length > 0
      ? Math.round(
          allCorrectRTs.reduce((a, b) => a + b, 0) / allCorrectRTs.length,
        )
      : 0;

  const switchCost =
    correctSwitchRTs.length > 0 && correctRepeatRTs.length > 0
      ? switchMeanRT - repeatMeanRT
      : 0;

  const overallAccuracy =
    analyzed.length > 0
      ? Math.round(
          (analyzed.filter((t) => t.correct).length / analyzed.length) * 1000,
        ) / 1000
      : 0;
  const switchAccuracy =
    switchTrials.length > 0
      ? Math.round(
          (switchTrials.filter((t) => t.correct).length / switchTrials.length) *
            1000,
        ) / 1000
      : 0;
  const repeatAccuracy =
    repeatTrials.length > 0
      ? Math.round(
          (repeatTrials.filter((t) => t.correct).length / repeatTrials.length) *
            1000,
        ) / 1000
      : 0;

  const timeoutCount = analyzed.filter((t) => t.timedOut).length;

  return {
    uid: crypto.randomUUID(),
    timestamp: Date.now(),
    durationMs,
    trials,
    switchCost,
    switchMeanRT,
    repeatMeanRT,
    overallMeanRT,
    overallAccuracy,
    switchAccuracy,
    repeatAccuracy,
    timeoutCount,
  };
}
