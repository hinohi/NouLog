import { useCallback, useEffect, useRef, useState } from "react";
import type { TaskSwitchResult, TaskSwitchTrial } from "../../db/schema.ts";
import {
  computeTaskSwitchMetrics,
  FEEDBACK_MS,
  getCorrectResponse,
  getTaskForTrial,
  getTrialCondition,
  ISI_MS,
  randomDigit,
  STIMULUS_TIMEOUT_MS,
  TOTAL_TRIALS,
} from "./taskswitch-logic.ts";

export type TaskSwitchPhase =
  | "idle"
  | "fixation"
  | "stimulus"
  | "feedback"
  | "done";

interface TaskSwitchState {
  phase: TaskSwitchPhase;
  trialIndex: number;
  currentTask: "parity" | "magnitude" | null;
  currentDigit: number | null;
  lastCorrect: boolean | null;
  result: TaskSwitchResult | null;
}

export function useTaskSwitch() {
  const [state, setState] = useState<TaskSwitchState>({
    phase: "idle",
    trialIndex: 0,
    currentTask: null,
    currentDigit: null,
    lastCorrect: null,
    result: null,
  });

  const startTimeRef = useRef(0);
  const stimulusTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trialsRef = useRef<TaskSwitchTrial[]>([]);
  const phaseRef = useRef<TaskSwitchPhase>("idle");
  const trialIndexRef = useRef(0);
  const currentDigitRef = useRef(0);
  const currentTaskRef = useRef<"parity" | "magnitude">("parity");

  const showStimulusRef = useRef<(index: number) => void>(() => {});
  const startFixationRef = useRef<(index: number) => void>(() => {});
  const showFeedbackRef = useRef<(index: number, correct: boolean) => void>(
    () => {},
  );

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    cleanup();
    const elapsed = performance.now() - startTimeRef.current;
    const result = computeTaskSwitchMetrics(
      trialsRef.current,
      Math.round(elapsed),
    );
    phaseRef.current = "done";
    setState((s) => ({
      ...s,
      phase: "done",
      result,
    }));
  }, [cleanup]);

  showFeedbackRef.current = (index: number, correct: boolean) => {
    cleanup();
    phaseRef.current = "feedback";
    setState((s) => ({
      ...s,
      phase: "feedback",
      lastCorrect: correct,
    }));

    timerRef.current = setTimeout(() => {
      startFixationRef.current(index + 1);
    }, FEEDBACK_MS);
  };

  showStimulusRef.current = (index: number) => {
    if (index >= TOTAL_TRIALS) {
      finish();
      return;
    }
    const task = getTaskForTrial(index);
    const digit = randomDigit();
    stimulusTimeRef.current = performance.now();
    phaseRef.current = "stimulus";
    trialIndexRef.current = index;
    currentDigitRef.current = digit;
    currentTaskRef.current = task;
    setState((s) => ({
      ...s,
      phase: "stimulus",
      trialIndex: index,
      currentTask: task,
      currentDigit: digit,
      lastCorrect: null,
    }));

    timerRef.current = setTimeout(() => {
      if (phaseRef.current === "stimulus" && trialIndexRef.current === index) {
        const condition = getTrialCondition(index);
        trialsRef.current.push({
          task,
          condition,
          digit,
          response: null,
          correct: false,
          rt: null,
          timedOut: true,
        });
        showFeedbackRef.current(index, false);
      }
    }, STIMULUS_TIMEOUT_MS);
  };

  startFixationRef.current = (index: number) => {
    if (index >= TOTAL_TRIALS) {
      finish();
      return;
    }
    cleanup();
    phaseRef.current = "fixation";
    trialIndexRef.current = index;
    setState((s) => ({
      ...s,
      phase: "fixation",
      trialIndex: index,
      currentTask: getTaskForTrial(index),
      currentDigit: null,
      lastCorrect: null,
    }));

    timerRef.current = setTimeout(() => {
      showStimulusRef.current(index);
    }, ISI_MS);
  };

  const start = useCallback(() => {
    cleanup();
    trialsRef.current = [];
    startTimeRef.current = performance.now();
    setState({
      phase: "fixation",
      trialIndex: 0,
      currentTask: getTaskForTrial(0),
      currentDigit: null,
      lastCorrect: null,
      result: null,
    });
    startFixationRef.current(0);
  }, [cleanup]);

  const respond = useCallback(
    (side: "left" | "right") => {
      if (phaseRef.current !== "stimulus") return;
      const index = trialIndexRef.current;
      const task = currentTaskRef.current;
      const digit = currentDigitRef.current;
      const rt = Math.round(performance.now() - stimulusTimeRef.current);
      const condition = getTrialCondition(index);
      const correctResponse = getCorrectResponse(task, digit);
      const correct = side === correctResponse;

      trialsRef.current.push({
        task,
        condition,
        digit,
        response: side,
        correct,
        rt,
        timedOut: false,
      });

      cleanup();
      showFeedbackRef.current(index, correct);
    },
    [cleanup],
  );

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return { ...state, start, respond };
}
