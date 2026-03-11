import { test, expect } from "bun:test";
import { computeMetrics, randomISI, PVT_ISI_MIN, PVT_ISI_MAX } from "./pvt-logic.ts";
import type { PVTTrial } from "../../db/schema.ts";

test("randomISI returns value within range", () => {
  for (let i = 0; i < 100; i++) {
    const isi = randomISI();
    expect(isi).toBeGreaterThanOrEqual(PVT_ISI_MIN);
    expect(isi).toBeLessThanOrEqual(PVT_ISI_MAX);
  }
});

test("computeMetrics with valid trials", () => {
  const trials: PVTTrial[] = [
    { rt: 200, falseStart: false, isi: 3000 },
    { rt: 300, falseStart: false, isi: 4000 },
    { rt: 400, falseStart: false, isi: 5000 },
  ];
  const result = computeMetrics(trials, 180000);
  expect(result.meanRT).toBe(300);
  expect(result.medianRT).toBe(300);
  expect(result.lapseCount).toBe(0);
  expect(result.falseStartCount).toBe(0);
  expect(result.validTrialCount).toBe(3);
});

test("computeMetrics counts lapses (RT > 500ms)", () => {
  const trials: PVTTrial[] = [
    { rt: 200, falseStart: false, isi: 3000 },
    { rt: 600, falseStart: false, isi: 4000 },
    { rt: 700, falseStart: false, isi: 5000 },
  ];
  const result = computeMetrics(trials, 180000);
  expect(result.lapseCount).toBe(2);
});

test("computeMetrics counts false starts", () => {
  const trials: PVTTrial[] = [
    { rt: 200, falseStart: false, isi: 3000 },
    { rt: 50, falseStart: true, isi: 4000 },
    { rt: 300, falseStart: false, isi: 5000 },
  ];
  const result = computeMetrics(trials, 180000);
  expect(result.falseStartCount).toBe(1);
  expect(result.validTrialCount).toBe(2);
  expect(result.meanRT).toBe(250);
});

test("computeMetrics with even number of valid trials (median)", () => {
  const trials: PVTTrial[] = [
    { rt: 200, falseStart: false, isi: 3000 },
    { rt: 400, falseStart: false, isi: 4000 },
  ];
  const result = computeMetrics(trials, 180000);
  expect(result.medianRT).toBe(300);
});

test("computeMetrics with no trials", () => {
  const result = computeMetrics([], 180000);
  expect(result.meanRT).toBe(0);
  expect(result.medianRT).toBe(0);
  expect(result.lapseCount).toBe(0);
  expect(result.falseStartCount).toBe(0);
  expect(result.validTrialCount).toBe(0);
});
