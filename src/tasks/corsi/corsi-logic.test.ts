import { describe, expect, test } from "bun:test";
import {
  CORSI_BLOCK_COUNT,
  checkSequence,
  computeCorsiResult,
  generateSequence,
} from "./corsi-logic.ts";

describe("generateSequence", () => {
  test("returns correct length", () => {
    for (let len = 2; len <= 9; len++) {
      const seq = generateSequence(len);
      expect(seq).toHaveLength(len);
    }
  });

  test("all indices are within range", () => {
    const seq = generateSequence(5);
    for (const idx of seq) {
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(CORSI_BLOCK_COUNT);
    }
  });

  test("no duplicate indices", () => {
    const seq = generateSequence(7);
    const unique = new Set(seq);
    expect(unique.size).toBe(seq.length);
  });
});

describe("checkSequence", () => {
  test("returns true for exact match", () => {
    expect(checkSequence([0, 3, 5], [0, 3, 5])).toBe(true);
  });

  test("returns false for wrong order", () => {
    expect(checkSequence([0, 3, 5], [0, 5, 3])).toBe(false);
  });

  test("returns false for different length", () => {
    expect(checkSequence([0, 3, 5], [0, 3])).toBe(false);
  });

  test("returns true for empty sequences", () => {
    expect(checkSequence([], [])).toBe(true);
  });
});

describe("computeCorsiResult", () => {
  test("computes blockSpan and totalScore correctly", () => {
    const trials = [
      { spanLength: 2, sequence: [0, 1], userInput: [0, 1], correct: true },
      { spanLength: 2, sequence: [3, 4], userInput: [3, 4], correct: true },
      {
        spanLength: 3,
        sequence: [1, 2, 3],
        userInput: [1, 2, 3],
        correct: true,
      },
      {
        spanLength: 3,
        sequence: [4, 5, 6],
        userInput: [4, 6, 5],
        correct: false,
      },
      {
        spanLength: 4,
        sequence: [0, 2, 5, 7],
        userInput: [0, 2, 5, 7],
        correct: true,
      },
      {
        spanLength: 4,
        sequence: [1, 3, 6, 8],
        userInput: [1, 3, 8, 6],
        correct: false,
      },
      {
        spanLength: 5,
        sequence: [0, 1, 2, 3, 4],
        userInput: [0, 1, 2, 4, 3],
        correct: false,
      },
      {
        spanLength: 5,
        sequence: [5, 6, 7, 8, 0],
        userInput: [5, 6, 7, 0, 8],
        correct: false,
      },
    ];
    const result = computeCorsiResult(trials, 30000);
    expect(typeof result.uid).toBe("string");
    expect(result.uid.length).toBeGreaterThan(0);
    expect(result.blockSpan).toBe(4);
    expect(result.totalScore).toBe(2 + 2 + 3 + 4);
    expect(result.totalTrials).toBe(8);
    expect(result.correctTrials).toBe(4);
  });

  test("returns blockSpan 0 when all trials wrong", () => {
    const trials = [
      { spanLength: 2, sequence: [0, 1], userInput: [1, 0], correct: false },
      { spanLength: 2, sequence: [3, 4], userInput: [4, 3], correct: false },
    ];
    const result = computeCorsiResult(trials, 5000);
    expect(result.blockSpan).toBe(0);
    expect(result.totalScore).toBe(0);
  });
});
