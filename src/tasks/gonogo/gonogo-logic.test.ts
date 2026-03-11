import { expect, test } from "bun:test";
import type { GoNogoTrial } from "../../db/schema.ts";
import {
  computeDPrime,
  computeGoNogoMetrics,
  GONOGO_GO_COUNT,
  GONOGO_ISI_MAX,
  GONOGO_ISI_MIN,
  GONOGO_NOGO_COUNT,
  GONOGO_TOTAL_TRIALS,
  generateTrialSequence,
  randomISI,
  zScore,
} from "./gonogo-logic.ts";

test("randomISI returns value within range", () => {
  for (let i = 0; i < 100; i++) {
    const isi = randomISI();
    expect(isi).toBeGreaterThanOrEqual(GONOGO_ISI_MIN);
    expect(isi).toBeLessThanOrEqual(GONOGO_ISI_MAX);
  }
});

test("generateTrialSequence returns correct counts", () => {
  const seq = generateTrialSequence();
  expect(seq.length).toBe(GONOGO_TOTAL_TRIALS);
  expect(seq.filter((t) => t === "go").length).toBe(GONOGO_GO_COUNT);
  expect(seq.filter((t) => t === "nogo").length).toBe(GONOGO_NOGO_COUNT);
});

test("generateTrialSequence is shuffled (not all go first)", () => {
  // Run multiple times to check randomness
  let allGoFirst = true;
  for (let i = 0; i < 10; i++) {
    const seq = generateTrialSequence();
    // Check if first 20 elements contain at least one nogo
    if (seq.slice(0, 20).includes("nogo")) {
      allGoFirst = false;
      break;
    }
  }
  expect(allGoFirst).toBe(false);
});

test("zScore of 0.5 is approximately 0", () => {
  expect(Math.abs(zScore(0.5))).toBeLessThan(0.001);
});

test("zScore of known values", () => {
  // z(0.8413) ≈ 1.0
  expect(zScore(0.8413)).toBeCloseTo(1.0, 1);
  // z(0.1587) ≈ -1.0
  expect(zScore(0.1587)).toBeCloseTo(-1.0, 1);
  // z(0.9772) ≈ 2.0
  expect(zScore(0.9772)).toBeCloseTo(2.0, 1);
});

test("zScore throws for out-of-range values", () => {
  expect(() => zScore(0)).toThrow();
  expect(() => zScore(1)).toThrow();
  expect(() => zScore(-0.1)).toThrow();
  expect(() => zScore(1.1)).toThrow();
});

test("computeDPrime with perfect performance", () => {
  // All go hits, no false alarms → high d'
  const dp = computeDPrime(60, 0, 60, 20);
  expect(dp).toBeGreaterThan(3);
});

test("computeDPrime with chance performance", () => {
  // Hit rate ≈ FA rate → d' ≈ 0
  const dp = computeDPrime(45, 15, 60, 20);
  expect(Math.abs(dp)).toBeLessThan(0.5);
});

test("computeDPrime with zero hits", () => {
  // Should not throw due to log-linear correction
  const dp = computeDPrime(0, 0, 60, 20);
  expect(typeof dp).toBe("number");
  expect(Number.isFinite(dp)).toBe(true);
});

test("computeGoNogoMetrics with all correct", () => {
  const trials: GoNogoTrial[] = [
    ...Array.from({ length: 60 }, (_, i) => ({
      type: "go" as const,
      responded: true,
      rt: 300 + i,
      isi: 1500,
    })),
    ...Array.from({ length: 20 }, () => ({
      type: "nogo" as const,
      responded: false,
      rt: null,
      isi: 1500,
    })),
  ];
  const result = computeGoNogoMetrics(trials, 240000);
  expect(typeof result.uid).toBe("string");
  expect(result.uid.length).toBeGreaterThan(0);
  expect(result.goHitRate).toBe(1);
  expect(result.falseAlarmRate).toBe(0);
  expect(result.omissionRate).toBe(0);
  expect(result.goMeanRT).toBeGreaterThan(0);
  expect(result.goMedianRT).toBeGreaterThan(0);
  expect(result.dPrime).toBeGreaterThan(3);
});

test("computeGoNogoMetrics with some errors", () => {
  const trials: GoNogoTrial[] = [
    // 50 go hits, 10 go misses
    ...Array.from({ length: 50 }, () => ({
      type: "go" as const,
      responded: true,
      rt: 350,
      isi: 1500,
    })),
    ...Array.from({ length: 10 }, () => ({
      type: "go" as const,
      responded: false,
      rt: null,
      isi: 1500,
    })),
    // 5 false alarms, 15 correct rejections
    ...Array.from({ length: 5 }, () => ({
      type: "nogo" as const,
      responded: true,
      rt: 400,
      isi: 1500,
    })),
    ...Array.from({ length: 15 }, () => ({
      type: "nogo" as const,
      responded: false,
      rt: null,
      isi: 1500,
    })),
  ];
  const result = computeGoNogoMetrics(trials, 240000);
  expect(result.goHitRate).toBeCloseTo(50 / 60, 2);
  expect(result.falseAlarmRate).toBeCloseTo(5 / 20, 2);
  expect(result.omissionRate).toBeCloseTo(10 / 60, 2);
  expect(result.goMeanRT).toBe(350);
  expect(result.dPrime).toBeGreaterThan(0);
});

test("computeGoNogoMetrics with no trials", () => {
  const result = computeGoNogoMetrics([], 0);
  expect(result.goHitRate).toBe(0);
  expect(result.falseAlarmRate).toBe(0);
  expect(result.omissionRate).toBe(0);
  expect(result.goMeanRT).toBe(0);
  expect(result.goMedianRT).toBe(0);
});
