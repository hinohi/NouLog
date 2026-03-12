import { expect, test } from "bun:test";
import type { TaskSwitchTrial } from "../../db/schema.ts";
import {
  computeTaskSwitchMetrics,
  DIGITS,
  getCorrectResponse,
  getTaskForTrial,
  getTrialCondition,
  PRACTICE_TRIALS,
  randomDigit,
  TOTAL_TRIALS,
} from "./taskswitch-logic.ts";

test("getTaskForTrial follows AABB pattern", () => {
  expect(getTaskForTrial(0)).toBe("parity");
  expect(getTaskForTrial(1)).toBe("parity");
  expect(getTaskForTrial(2)).toBe("magnitude");
  expect(getTaskForTrial(3)).toBe("magnitude");
  expect(getTaskForTrial(4)).toBe("parity");
  expect(getTaskForTrial(5)).toBe("parity");
  expect(getTaskForTrial(6)).toBe("magnitude");
  expect(getTaskForTrial(7)).toBe("magnitude");
});

test("getTrialCondition returns correct conditions", () => {
  expect(getTrialCondition(0)).toBe("first");
  expect(getTrialCondition(1)).toBe("repeat");
  expect(getTrialCondition(2)).toBe("switch");
  expect(getTrialCondition(3)).toBe("repeat");
  expect(getTrialCondition(4)).toBe("switch");
  expect(getTrialCondition(5)).toBe("repeat");
});

test("randomDigit returns valid digit", () => {
  for (let i = 0; i < 100; i++) {
    const d = randomDigit();
    expect(DIGITS).toContain(d);
    expect(d).not.toBe(5);
  }
});

test("getCorrectResponse for parity task", () => {
  expect(getCorrectResponse("parity", 1)).toBe("left");
  expect(getCorrectResponse("parity", 3)).toBe("left");
  expect(getCorrectResponse("parity", 7)).toBe("left");
  expect(getCorrectResponse("parity", 9)).toBe("left");
  expect(getCorrectResponse("parity", 2)).toBe("right");
  expect(getCorrectResponse("parity", 4)).toBe("right");
  expect(getCorrectResponse("parity", 6)).toBe("right");
  expect(getCorrectResponse("parity", 8)).toBe("right");
});

test("getCorrectResponse for magnitude task", () => {
  expect(getCorrectResponse("magnitude", 1)).toBe("left");
  expect(getCorrectResponse("magnitude", 2)).toBe("left");
  expect(getCorrectResponse("magnitude", 3)).toBe("left");
  expect(getCorrectResponse("magnitude", 4)).toBe("left");
  expect(getCorrectResponse("magnitude", 6)).toBe("right");
  expect(getCorrectResponse("magnitude", 7)).toBe("right");
  expect(getCorrectResponse("magnitude", 8)).toBe("right");
  expect(getCorrectResponse("magnitude", 9)).toBe("right");
});

test("computeTaskSwitchMetrics with perfect performance", () => {
  const trials: TaskSwitchTrial[] = Array.from(
    { length: TOTAL_TRIALS },
    (_, i) => {
      const task = getTaskForTrial(i);
      const condition = getTrialCondition(i);
      const digit = task === "parity" ? 3 : 7;
      return {
        task,
        condition,
        digit,
        response: getCorrectResponse(task, digit),
        correct: true,
        rt: condition === "switch" ? 500 : 400,
        timedOut: false,
      };
    },
  );

  const result = computeTaskSwitchMetrics(trials, 60000);
  expect(result.overallAccuracy).toBe(1);
  expect(result.switchAccuracy).toBe(1);
  expect(result.repeatAccuracy).toBe(1);
  expect(result.switchCost).toBe(100);
  expect(result.switchMeanRT).toBe(500);
  expect(result.repeatMeanRT).toBe(400);
  expect(result.timeoutCount).toBe(0);
  expect(result.trials.length).toBe(TOTAL_TRIALS);
});

test("computeTaskSwitchMetrics excludes practice trials", () => {
  const trials: TaskSwitchTrial[] = Array.from(
    { length: TOTAL_TRIALS },
    (_, i) => {
      const task = getTaskForTrial(i);
      const condition = getTrialCondition(i);
      const digit = 3;
      return {
        task,
        condition,
        digit,
        response:
          i < PRACTICE_TRIALS ? "right" : getCorrectResponse(task, digit),
        correct: i >= PRACTICE_TRIALS,
        rt: 400,
        timedOut: false,
      };
    },
  );

  const result = computeTaskSwitchMetrics(trials, 60000);
  expect(result.overallAccuracy).toBe(1);
});

test("computeTaskSwitchMetrics with some timeouts", () => {
  const trials: TaskSwitchTrial[] = Array.from(
    { length: TOTAL_TRIALS },
    (_, i) => {
      const task = getTaskForTrial(i);
      const condition = getTrialCondition(i);
      const digit = 3;
      const timedOut = i >= PRACTICE_TRIALS && i % 10 === 0;
      return {
        task,
        condition,
        digit,
        response: timedOut ? null : getCorrectResponse(task, digit),
        correct: !timedOut,
        rt: timedOut ? null : 400,
        timedOut,
      };
    },
  );

  const result = computeTaskSwitchMetrics(trials, 60000);
  expect(result.timeoutCount).toBeGreaterThan(0);
  expect(result.overallAccuracy).toBeLessThan(1);
});

test("computeTaskSwitchMetrics with empty trials", () => {
  const result = computeTaskSwitchMetrics([], 0);
  expect(result.switchCost).toBe(0);
  expect(result.overallMeanRT).toBe(0);
  expect(result.overallAccuracy).toBe(0);
  expect(result.timeoutCount).toBe(0);
});

test("computeTaskSwitchMetrics with only practice trials", () => {
  const trials: TaskSwitchTrial[] = Array.from(
    { length: PRACTICE_TRIALS },
    (_, i) => ({
      task: getTaskForTrial(i),
      condition: getTrialCondition(i),
      digit: 3,
      response: "left" as const,
      correct: true,
      rt: 400,
      timedOut: false,
    }),
  );

  const result = computeTaskSwitchMetrics(trials, 5000);
  expect(result.overallAccuracy).toBe(0);
  expect(result.switchCost).toBe(0);
});
