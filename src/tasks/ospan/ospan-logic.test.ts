import { test, expect } from "bun:test";
import {
  generateSetOrder,
  generateLetters,
  generateMathProblem,
  scoreSet,
  computeOSPANResult,
  LETTER_POOL,
  SET_SIZES,
  SETS_PER_SIZE,
} from "./ospan-logic.ts";
import type { OSPANSet, OSPANMathProblem } from "../../db/schema.ts";

test("generateSetOrder produces correct number of sets", () => {
  const order = generateSetOrder();
  expect(order.length).toBe(SET_SIZES.length * SETS_PER_SIZE);
});

test("generateSetOrder includes each size correct number of times", () => {
  const order = generateSetOrder();
  for (const size of SET_SIZES) {
    expect(order.filter((s) => s === size).length).toBe(SETS_PER_SIZE);
  }
});

test("generateLetters returns correct count of unique letters", () => {
  const letters = generateLetters(5);
  expect(letters.length).toBe(5);
  expect(new Set(letters).size).toBe(5);
  for (const l of letters) {
    expect((LETTER_POOL as readonly string[]).includes(l)).toBe(true);
  }
});

test("generateMathProblem returns valid problem", () => {
  for (let i = 0; i < 50; i++) {
    const problem = generateMathProblem();
    expect(problem.expression).toMatch(/^\(\d+ [+-] \d+\) = -?\d+\?$/);
    expect(typeof problem.correctAnswer).toBe("boolean");
  }
});

test("scoreSet with perfect recall", () => {
  const result = scoreSet(["F", "H", "J"], ["F", "H", "J"]);
  expect(result.perfectRecall).toBe(true);
  expect(result.correctLetterCount).toBe(3);
});

test("scoreSet with partial recall", () => {
  const result = scoreSet(["F", "H", "J"], ["F", "K", "J"]);
  expect(result.perfectRecall).toBe(false);
  expect(result.correctLetterCount).toBe(2);
});

test("scoreSet with wrong order", () => {
  const result = scoreSet(["F", "H", "J"], ["H", "F", "J"]);
  expect(result.perfectRecall).toBe(false);
  expect(result.correctLetterCount).toBe(1);
});

test("scoreSet with fewer recalled letters", () => {
  const result = scoreSet(["F", "H", "J"], ["F"]);
  expect(result.perfectRecall).toBe(false);
  expect(result.correctLetterCount).toBe(1);
});

test("computeOSPANResult calculates scores correctly", () => {
  const makeMath = (correct: boolean): OSPANMathProblem => ({
    expression: "(1 + 1) = 2?",
    correctAnswer: true,
    userAnswer: true,
    correct,
    responseTimeMs: 1000,
  });

  const sets: OSPANSet[] = [
    {
      setSize: 3,
      letters: ["F", "H", "J"],
      recalledLetters: ["F", "H", "J"],
      perfectRecall: true,
      correctLetterCount: 3,
      mathProblems: [makeMath(true), makeMath(true), makeMath(false)],
    },
    {
      setSize: 4,
      letters: ["K", "L", "N", "P"],
      recalledLetters: ["K", "L", "Q", "P"],
      perfectRecall: false,
      correctLetterCount: 3,
      mathProblems: [makeMath(true), makeMath(true), makeMath(true), makeMath(true)],
    },
  ];

  const result = computeOSPANResult(sets);
  expect(result.absoluteScore).toBe(3);
  expect(result.partialScore).toBe(6);
  expect(result.totalLetters).toBe(7);
  expect(result.totalMathProblems).toBe(7);
  expect(result.mathAccuracy).toBeCloseTo(6 / 7, 5);
});
