export interface PVTTrial {
  rt: number;
  falseStart: boolean;
  isi: number;
}

export interface PVTResult {
  id?: number;
  timestamp: number;
  durationMs: number;
  trials: PVTTrial[];
  meanRT: number;
  medianRT: number;
  lapseCount: number;
  falseStartCount: number;
  validTrialCount: number;
}

export interface OSPANMathProblem {
  expression: string;
  correctAnswer: boolean;
  userAnswer: boolean;
  correct: boolean;
  responseTimeMs: number;
}

export interface OSPANSet {
  setSize: number;
  letters: string[];
  recalledLetters: string[];
  perfectRecall: boolean;
  correctLetterCount: number;
  mathProblems: OSPANMathProblem[];
}

export interface OSPANResult {
  id?: number;
  timestamp: number;
  sets: OSPANSet[];
  absoluteScore: number;
  partialScore: number;
  totalLetters: number;
  mathAccuracy: number;
  totalMathProblems: number;
}
