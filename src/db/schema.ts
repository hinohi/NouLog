export interface PVTTrial {
  rt: number;
  falseStart: boolean;
  isi: number;
}

export interface PVTResult {
  id?: number;
  uid: string;
  timestamp: number;
  durationMs: number;
  trials: PVTTrial[];
  meanRT: number;
  medianRT: number;
  sdRT: number;
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
  uid: string;
  timestamp: number;
  sets: OSPANSet[];
  absoluteScore: number;
  partialScore: number;
  totalLetters: number;
  mathAccuracy: number;
  totalMathProblems: number;
}

export interface GoNogoTrial {
  type: "go" | "nogo";
  responded: boolean;
  rt: number | null;
  isi: number;
}

export interface GoNogoResult {
  id?: number;
  uid: string;
  timestamp: number;
  durationMs: number;
  trials: GoNogoTrial[];
  dPrime: number;
  goHitRate: number;
  goMeanRT: number;
  goMedianRT: number;
  falseAlarmRate: number;
  omissionRate: number;
}

export interface CorsiTrial {
  spanLength: number;
  sequence: number[];
  userInput: number[];
  correct: boolean;
}

export interface CorsiResult {
  id?: number;
  uid: string;
  timestamp: number;
  durationMs: number;
  trials: CorsiTrial[];
  blockSpan: number;
  totalScore: number;
  longestSequence: number;
  totalTrials: number;
  correctTrials: number;
}

export interface ExportData {
  exportedAt: string;
  pvtResults: PVTResult[];
  ospanResults: OSPANResult[];
  gonogoResults: GoNogoResult[];
  corsiResults: CorsiResult[];
}

export interface ImportResult {
  pvt: { imported: number; skipped: number };
  ospan: { imported: number; skipped: number };
  gonogo: { imported: number; skipped: number };
  corsi: { imported: number; skipped: number };
}
