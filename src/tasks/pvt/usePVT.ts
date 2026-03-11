import { useCallback, useEffect, useRef, useState } from "react";
import type { PVTResult, PVTTrial } from "../../db/schema.ts";
import { computeMetrics, PVT_DURATION_MS, randomISI } from "./pvt-logic.ts";

type PVTPhase = "idle" | "waiting" | "stimulus" | "done";

interface PVTState {
  phase: PVTPhase;
  trials: PVTTrial[];
  currentISI: number;
  elapsedMs: number;
  result: PVTResult | null;
}

export function usePVT() {
  const [state, setState] = useState<PVTState>({
    phase: "idle",
    trials: [],
    currentISI: 0,
    elapsedMs: 0,
    result: null,
  });

  const startTimeRef = useRef(0);
  const stimulusTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trialsRef = useRef<PVTTrial[]>([]);
  const phaseRef = useRef<PVTPhase>("idle");
  const currentISIRef = useRef(0);

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (tickRef.current !== null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    cleanup();
    const elapsed = performance.now() - startTimeRef.current;
    const result = computeMetrics(trialsRef.current, Math.round(elapsed));
    phaseRef.current = "done";
    setState((s) => ({
      ...s,
      phase: "done",
      result,
      elapsedMs: Math.round(elapsed),
    }));
  }, [cleanup]);

  const scheduleStimulus = useCallback(() => {
    const remaining =
      PVT_DURATION_MS - (performance.now() - startTimeRef.current);
    if (remaining <= 0) {
      finish();
      return;
    }
    const isi = randomISI();
    currentISIRef.current = isi;
    phaseRef.current = "waiting";
    setState((s) => ({ ...s, phase: "waiting", currentISI: isi }));

    timerRef.current = setTimeout(
      () => {
        const now = performance.now();
        if (now - startTimeRef.current >= PVT_DURATION_MS) {
          finish();
          return;
        }
        stimulusTimeRef.current = now;
        phaseRef.current = "stimulus";
        setState((s) => ({ ...s, phase: "stimulus" }));
      },
      Math.min(isi, remaining),
    );
  }, [finish]);

  const start = useCallback(() => {
    cleanup();
    trialsRef.current = [];
    startTimeRef.current = performance.now();
    setState({
      phase: "waiting",
      trials: [],
      currentISI: 0,
      elapsedMs: 0,
      result: null,
    });

    tickRef.current = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      if (elapsed >= PVT_DURATION_MS) {
        finish();
      } else {
        setState((s) => ({ ...s, elapsedMs: Math.round(elapsed) }));
      }
    }, 200);

    scheduleStimulus();
  }, [cleanup, finish, scheduleStimulus]);

  const respond = useCallback(() => {
    const phase = phaseRef.current;
    if (phase === "stimulus") {
      const rt = Math.round(performance.now() - stimulusTimeRef.current);
      const trial: PVTTrial = {
        rt,
        falseStart: false,
        isi: currentISIRef.current,
      };
      trialsRef.current.push(trial);
      setState((s) => ({ ...s, trials: [...trialsRef.current] }));
      scheduleStimulus();
    } else if (phase === "waiting") {
      const trial: PVTTrial = {
        rt: 0,
        falseStart: true,
        isi: currentISIRef.current,
      };
      trialsRef.current.push(trial);
      setState((s) => ({ ...s, trials: [...trialsRef.current] }));
    }
  }, [scheduleStimulus]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { ...state, start, respond };
}
