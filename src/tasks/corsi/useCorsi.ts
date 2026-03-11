import { useCallback, useEffect, useRef, useState } from "react";
import type { CorsiResult, CorsiTrial } from "../../db/schema.ts";
import {
  CORSI_INITIAL_SPAN,
  CORSI_LIGHT_DURATION_MS,
  CORSI_LIGHT_INTERVAL_MS,
  CORSI_MAX_SPAN,
  CORSI_TRIALS_PER_SPAN,
  checkSequence,
  computeCorsiResult,
  generateSequence,
} from "./corsi-logic.ts";

export type CorsiPhase =
  | "idle"
  | "watching"
  | "recalling"
  | "feedback"
  | "done";

interface CorsiState {
  phase: CorsiPhase;
  currentSpan: number;
  trialInSpan: number;
  sequence: number[];
  litBlock: number | null;
  userInput: number[];
  lastCorrect: boolean | null;
  consecutiveErrors: number;
  result: CorsiResult | null;
}

export function useCorsi() {
  const [state, setState] = useState<CorsiState>({
    phase: "idle",
    currentSpan: CORSI_INITIAL_SPAN,
    trialInSpan: 0,
    sequence: [],
    litBlock: null,
    userInput: [],
    lastCorrect: null,
    consecutiveErrors: 0,
    result: null,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef(0);
  const trialsRef = useRef<CorsiTrial[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    cleanup();
    const elapsed = performance.now() - startTimeRef.current;
    const result = computeCorsiResult(trialsRef.current, Math.round(elapsed));
    setState((s) => ({ ...s, phase: "done", result }));
  }, [cleanup]);

  const playSequence = useCallback((seq: number[]) => {
    let step = 0;
    const showNext = () => {
      if (step < seq.length) {
        const blockIndex = seq[step]!;
        setState((s) => ({ ...s, litBlock: blockIndex }));
        timerRef.current = setTimeout(() => {
          setState((s) => ({ ...s, litBlock: null }));
          step++;
          timerRef.current = setTimeout(showNext, CORSI_LIGHT_INTERVAL_MS);
        }, CORSI_LIGHT_DURATION_MS);
      } else {
        setState((s) => ({ ...s, phase: "recalling", litBlock: null }));
      }
    };
    showNext();
  }, []);

  const startTrial = useCallback(
    (span: number, trialInSpan: number, consecutiveErrors: number) => {
      cleanup();
      const seq = generateSequence(span);
      setState((s) => ({
        ...s,
        phase: "watching",
        currentSpan: span,
        trialInSpan,
        sequence: seq,
        litBlock: null,
        userInput: [],
        lastCorrect: null,
        consecutiveErrors,
      }));
      // Small delay before starting playback
      timerRef.current = setTimeout(() => {
        playSequence(seq);
      }, 500);
    },
    [cleanup, playSequence],
  );

  const start = useCallback(() => {
    cleanup();
    trialsRef.current = [];
    startTimeRef.current = performance.now();
    setState({
      phase: "watching",
      currentSpan: CORSI_INITIAL_SPAN,
      trialInSpan: 0,
      sequence: [],
      litBlock: null,
      userInput: [],
      lastCorrect: null,
      consecutiveErrors: 0,
      result: null,
    });
    startTrial(CORSI_INITIAL_SPAN, 0, 0);
  }, [cleanup, startTrial]);

  const advanceAfterFeedback = useCallback(
    (
      correct: boolean,
      span: number,
      trialInSpan: number,
      consecutiveErrors: number,
    ) => {
      const newConsecutiveErrors = correct ? 0 : consecutiveErrors + 1;

      if (newConsecutiveErrors >= CORSI_TRIALS_PER_SPAN) {
        // Two consecutive errors at this span -> done
        timerRef.current = setTimeout(finish, 1000);
        return;
      }

      const nextTrialInSpan = trialInSpan + 1;
      if (nextTrialInSpan >= CORSI_TRIALS_PER_SPAN) {
        // Move to next span
        const nextSpan = span + 1;
        if (nextSpan > CORSI_MAX_SPAN) {
          timerRef.current = setTimeout(finish, 1000);
          return;
        }
        timerRef.current = setTimeout(
          () => startTrial(nextSpan, 0, newConsecutiveErrors),
          1000,
        );
      } else {
        timerRef.current = setTimeout(
          () => startTrial(span, nextTrialInSpan, newConsecutiveErrors),
          1000,
        );
      }
    },
    [finish, startTrial],
  );

  const tapBlock = useCallback(
    (index: number) => {
      const s = stateRef.current;
      if (s.phase !== "recalling") return;

      const newInput = [...s.userInput, index];
      setState((prev) => ({ ...prev, userInput: newInput }));

      if (newInput.length >= s.sequence.length) {
        // Check answer
        const correct = checkSequence(s.sequence, newInput);
        trialsRef.current.push({
          spanLength: s.currentSpan,
          sequence: s.sequence,
          userInput: newInput,
          correct,
        });
        setState((prev) => ({
          ...prev,
          phase: "feedback",
          userInput: newInput,
          lastCorrect: correct,
        }));
        advanceAfterFeedback(
          correct,
          s.currentSpan,
          s.trialInSpan,
          s.consecutiveErrors,
        );
      }
    },
    [advanceAfterFeedback],
  );

  const undoTap = useCallback(() => {
    const s = stateRef.current;
    if (s.phase !== "recalling" || s.userInput.length === 0) return;
    setState((prev) => ({
      ...prev,
      userInput: prev.userInput.slice(0, -1),
    }));
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    phase: state.phase,
    currentSpan: state.currentSpan,
    trialInSpan: state.trialInSpan,
    sequence: state.sequence,
    litBlock: state.litBlock,
    userInput: state.userInput,
    lastCorrect: state.lastCorrect,
    result: state.result,
    start,
    tapBlock,
    undoTap,
  };
}
