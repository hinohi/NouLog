import { useCallback, useEffect, useRef, useState } from "react";
import type { GoNogoResult, GoNogoTrial } from "../../db/schema.ts";
import {
  computeGoNogoMetrics,
  GONOGO_STIMULUS_TIMEOUT_MS,
  GONOGO_TOTAL_TRIALS,
  generateTrialSequence,
  randomISI,
} from "./gonogo-logic.ts";

type GoNogoPhase = "idle" | "fixation" | "stimulus" | "done";

interface GoNogoState {
  phase: GoNogoPhase;
  trialIndex: number;
  currentType: "go" | "nogo" | null;
  result: GoNogoResult | null;
}

export function useGoNogo() {
  const [state, setState] = useState<GoNogoState>({
    phase: "idle",
    trialIndex: 0,
    currentType: null,
    result: null,
  });

  const startTimeRef = useRef(0);
  const stimulusTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trialsRef = useRef<GoNogoTrial[]>([]);
  const sequenceRef = useRef<("go" | "nogo")[]>([]);
  const phaseRef = useRef<GoNogoPhase>("idle");
  const trialIndexRef = useRef(0);

  // Use refs for mutual recursion between showStimulus and startFixation
  const showStimulusRef = useRef<(index: number) => void>(() => {});
  const startFixationRef = useRef<(index: number) => void>(() => {});

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    cleanup();
    const elapsed = performance.now() - startTimeRef.current;
    const result = computeGoNogoMetrics(trialsRef.current, Math.round(elapsed));
    phaseRef.current = "done";
    setState((s) => ({
      ...s,
      phase: "done",
      result,
    }));
  }, [cleanup]);

  // Keep refs up to date
  showStimulusRef.current = (index: number) => {
    if (index >= GONOGO_TOTAL_TRIALS) {
      finish();
      return;
    }
    const trialType = sequenceRef.current[index]!;
    stimulusTimeRef.current = performance.now();
    phaseRef.current = "stimulus";
    trialIndexRef.current = index;
    setState((s) => ({
      ...s,
      phase: "stimulus",
      trialIndex: index,
      currentType: trialType,
    }));

    // Auto-advance on timeout (no response)
    timerRef.current = setTimeout(() => {
      if (phaseRef.current === "stimulus" && trialIndexRef.current === index) {
        trialsRef.current.push({
          type: trialType,
          responded: false,
          rt: null,
          isi: 0,
        });
        startFixationRef.current(index + 1);
      }
    }, GONOGO_STIMULUS_TIMEOUT_MS);
  };

  startFixationRef.current = (index: number) => {
    if (index >= GONOGO_TOTAL_TRIALS) {
      finish();
      return;
    }
    cleanup();
    const isi = randomISI();
    phaseRef.current = "fixation";
    trialIndexRef.current = index;
    setState((s) => ({
      ...s,
      phase: "fixation",
      trialIndex: index,
      currentType: null,
    }));

    timerRef.current = setTimeout(() => {
      showStimulusRef.current(index);
    }, isi);
  };

  const start = useCallback(() => {
    cleanup();
    trialsRef.current = [];
    sequenceRef.current = generateTrialSequence();
    startTimeRef.current = performance.now();
    setState({
      phase: "fixation",
      trialIndex: 0,
      currentType: null,
      result: null,
    });
    startFixationRef.current(0);
  }, [cleanup]);

  const respond = useCallback(() => {
    if (phaseRef.current !== "stimulus") return;
    const index = trialIndexRef.current;
    const trialType = sequenceRef.current[index]!;
    const rt = Math.round(performance.now() - stimulusTimeRef.current);

    trialsRef.current.push({
      type: trialType,
      responded: true,
      rt,
      isi: 0,
    });

    cleanup();
    startFixationRef.current(index + 1);
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { ...state, start, respond };
}
