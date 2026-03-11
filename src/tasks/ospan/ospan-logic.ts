import type { OSPANResult, OSPANSet } from "../../db/schema.ts";

export const LETTER_POOL = [
  "F",
  "H",
  "J",
  "K",
  "L",
  "N",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "Y",
] as const;
export const SET_SIZES = [3, 4, 5, 6, 7] as const;
export const SETS_PER_SIZE = 3;
export const LETTER_DISPLAY_MS = 1000;

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

export function generateSetOrder(): number[] {
  const sizes: number[] = [];
  for (const size of SET_SIZES) {
    for (let i = 0; i < SETS_PER_SIZE; i++) {
      sizes.push(size);
    }
  }
  return shuffle(sizes);
}

export function generateLetters(count: number): string[] {
  const shuffled = shuffle([...LETTER_POOL]);
  return shuffled.slice(0, count);
}

export interface MathProblemDef {
  expression: string;
  proposedAnswer: number;
  correctAnswer: boolean;
}

export function generateMathProblem(): MathProblemDef {
  const ops = ["+", "-"] as const;
  const op = ops[Math.floor(Math.random() * ops.length)]!;
  let a: number, b: number, result: number;

  if (op === "+") {
    a = Math.floor(Math.random() * 9) + 1;
    b = Math.floor(Math.random() * 9) + 1;
    result = a + b;
  } else {
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * (a - 1)) + 1;
    result = a - b;
  }

  const isCorrect = Math.random() < 0.5;
  const proposed = isCorrect
    ? result
    : result +
      (Math.random() < 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);

  return {
    expression: `(${a} ${op} ${b}) = ${proposed}?`,
    proposedAnswer: proposed,
    correctAnswer: isCorrect,
  };
}

export function scoreSet(
  letters: string[],
  recalledLetters: string[],
): { perfectRecall: boolean; correctLetterCount: number } {
  let correctCount = 0;
  for (let i = 0; i < letters.length; i++) {
    if (i < recalledLetters.length && recalledLetters[i] === letters[i]) {
      correctCount++;
    }
  }
  return {
    perfectRecall: correctCount === letters.length,
    correctLetterCount: correctCount,
  };
}

export function computeOSPANResult(sets: OSPANSet[]): OSPANResult {
  let absoluteScore = 0;
  let partialScore = 0;
  let totalLetters = 0;
  let totalMathCorrect = 0;
  let totalMathProblems = 0;

  for (const set of sets) {
    totalLetters += set.setSize;
    partialScore += set.correctLetterCount;
    if (set.perfectRecall) {
      absoluteScore += set.setSize;
    }
    for (const mp of set.mathProblems) {
      totalMathProblems++;
      if (mp.correct) totalMathCorrect++;
    }
  }

  return {
    uid: crypto.randomUUID(),
    timestamp: Date.now(),
    sets,
    absoluteScore,
    partialScore,
    totalLetters,
    mathAccuracy:
      totalMathProblems > 0 ? totalMathCorrect / totalMathProblems : 0,
    totalMathProblems,
  };
}
