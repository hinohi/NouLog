import { useCallback, useEffect, useRef, useState } from "react";
import type {
  OSPANMathProblem,
  OSPANResult,
  OSPANSet,
} from "../../db/schema.ts";
import {
  computeOSPANResult,
  generateLetters,
  generateMathProblem,
  generateSetOrder,
  LETTER_DISPLAY_MS,
  type MathProblemDef,
  scoreSet,
} from "./ospan-logic.ts";

type Phase = "idle" | "math" | "showLetter" | "recall" | "done";

interface OSPANState {
  phase: Phase;
  currentSetIndex: number;
  currentItemIndex: number;
  totalSets: number;
  currentSetSize: number;
  currentLetter: string;
  currentMathProblem: MathProblemDef | null;
  recalledLetters: string[];
  completedSets: OSPANSet[];
  result: OSPANResult | null;
}

export function useOSPAN() {
  const [state, setState] = useState<OSPANState>({
    phase: "idle",
    currentSetIndex: 0,
    currentItemIndex: 0,
    totalSets: 0,
    currentSetSize: 0,
    currentLetter: "",
    currentMathProblem: null,
    recalledLetters: [],
    completedSets: [],
    result: null,
  });

  const setOrderRef = useRef<number[]>([]);
  const lettersRef = useRef<string[]>([]);
  const mathProblemsRef = useRef<OSPANMathProblem[]>([]);
  const mathStartRef = useRef(0);
  const letterTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (letterTimerRef.current !== null) {
      clearTimeout(letterTimerRef.current);
      letterTimerRef.current = null;
    }
  }, []);

  const startMath = useCallback((setIndex: number, itemIndex: number) => {
    const problem = generateMathProblem();
    mathStartRef.current = performance.now();
    setState((s) => ({
      ...s,
      phase: "math",
      currentSetIndex: setIndex,
      currentItemIndex: itemIndex,
      currentMathProblem: problem,
    }));
  }, []);

  const showLetter = useCallback(
    (setIndex: number, itemIndex: number) => {
      const letter = lettersRef.current[itemIndex]!;
      setState((s) => ({
        ...s,
        phase: "showLetter",
        currentLetter: letter,
      }));

      letterTimerRef.current = setTimeout(() => {
        const setSize = setOrderRef.current[setIndex]!;
        const nextItem = itemIndex + 1;
        if (nextItem < setSize) {
          startMath(setIndex, nextItem);
        } else {
          setState((s) => ({
            ...s,
            phase: "recall",
            recalledLetters: [],
          }));
        }
      }, LETTER_DISPLAY_MS);
    },
    [startMath],
  );

  const beginSet = useCallback(
    (setIndex: number) => {
      const setSize = setOrderRef.current[setIndex]!;
      lettersRef.current = generateLetters(setSize);
      mathProblemsRef.current = [];
      setState((s) => ({
        ...s,
        currentSetSize: setSize,
        currentSetIndex: setIndex,
        currentItemIndex: 0,
      }));
      startMath(setIndex, 0);
    },
    [startMath],
  );

  const start = useCallback(() => {
    cleanup();
    const order = generateSetOrder();
    setOrderRef.current = order;
    setState({
      phase: "math",
      currentSetIndex: 0,
      currentItemIndex: 0,
      totalSets: order.length,
      currentSetSize: order[0]!,
      currentLetter: "",
      currentMathProblem: null,
      recalledLetters: [],
      completedSets: [],
      result: null,
    });
    beginSet(0);
  }, [cleanup, beginSet]);

  const answerMath = useCallback(
    (answer: boolean) => {
      if (state.phase !== "math" || !state.currentMathProblem) return;
      const responseTime = Math.round(performance.now() - mathStartRef.current);
      const mp: OSPANMathProblem = {
        expression: state.currentMathProblem.expression,
        correctAnswer: state.currentMathProblem.correctAnswer,
        userAnswer: answer,
        correct: answer === state.currentMathProblem.correctAnswer,
        responseTimeMs: responseTime,
      };
      mathProblemsRef.current.push(mp);
      showLetter(state.currentSetIndex, state.currentItemIndex);
    },
    [
      state.phase,
      state.currentMathProblem,
      state.currentSetIndex,
      state.currentItemIndex,
      showLetter,
    ],
  );

  const recallLetter = useCallback(
    (letter: string) => {
      if (state.phase !== "recall") return;
      setState((s) => ({
        ...s,
        recalledLetters: [...s.recalledLetters, letter],
      }));
    },
    [state.phase],
  );

  const undoRecall = useCallback(() => {
    if (state.phase !== "recall") return;
    setState((s) => ({
      ...s,
      recalledLetters: s.recalledLetters.slice(0, -1),
    }));
  }, [state.phase]);

  const confirmRecall = useCallback(() => {
    if (state.phase !== "recall") return;

    const { perfectRecall, correctLetterCount } = scoreSet(
      lettersRef.current,
      state.recalledLetters,
    );
    const set: OSPANSet = {
      setSize: state.currentSetSize,
      letters: [...lettersRef.current],
      recalledLetters: [...state.recalledLetters],
      perfectRecall,
      correctLetterCount,
      mathProblems: [...mathProblemsRef.current],
    };

    const newSets = [...state.completedSets, set];
    const nextSetIndex = state.currentSetIndex + 1;

    if (nextSetIndex >= state.totalSets) {
      const result = computeOSPANResult(newSets);
      setState((s) => ({
        ...s,
        phase: "done",
        completedSets: newSets,
        result,
      }));
    } else {
      setState((s) => ({
        ...s,
        completedSets: newSets,
      }));
      beginSet(nextSetIndex);
    }
  }, [
    state.phase,
    state.recalledLetters,
    state.currentSetSize,
    state.completedSets,
    state.currentSetIndex,
    state.totalSets,
    beginSet,
  ]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ...state,
    start,
    answerMath,
    recallLetter,
    undoRecall,
    confirmRecall,
  };
}
