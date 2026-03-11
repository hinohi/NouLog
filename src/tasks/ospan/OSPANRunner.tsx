import { LETTER_POOL } from "./ospan-logic.ts";
import type { MathProblemDef } from "./ospan-logic.ts";

interface Props {
  phase: "math" | "showLetter" | "recall";
  currentSetIndex: number;
  totalSets: number;
  currentSetSize: number;
  currentItemIndex: number;
  currentLetter: string;
  currentMathProblem: MathProblemDef | null;
  recalledLetters: string[];
  onAnswerMath: (answer: boolean) => void;
  onRecallLetter: (letter: string) => void;
  onUndoRecall: () => void;
  onConfirmRecall: () => void;
}

export function OSPANRunner({
  phase,
  currentSetIndex,
  totalSets,
  currentSetSize,
  currentItemIndex,
  currentLetter,
  currentMathProblem,
  recalledLetters,
  onAnswerMath,
  onRecallLetter,
  onUndoRecall,
  onConfirmRecall,
}: Props) {
  return (
    <div className="ospan-runner">
      <div className="ospan-progress">
        セット {currentSetIndex + 1} / {totalSets} (サイズ: {currentSetSize})
      </div>

      {phase === "math" && currentMathProblem && (
        <div className="ospan-math">
          <p className="ospan-math-expression">{currentMathProblem.expression}</p>
          <div className="ospan-math-buttons">
            <button className="btn btn-correct" onClick={() => onAnswerMath(true)}>
              正しい
            </button>
            <button className="btn btn-wrong" onClick={() => onAnswerMath(false)}>
              間違い
            </button>
          </div>
        </div>
      )}

      {phase === "showLetter" && (
        <div className="ospan-letter-display">
          <span className="ospan-letter">{currentLetter}</span>
          <p className="ospan-letter-hint">この文字を覚えてください ({currentItemIndex + 1}/{currentSetSize})</p>
        </div>
      )}

      {phase === "recall" && (
        <div className="ospan-recall">
          <p className="ospan-recall-title">覚えた文字を順番にタップしてください</p>
          <div className="ospan-recalled">
            {recalledLetters.length > 0
              ? recalledLetters.join(" → ")
              : "(まだ選択されていません)"}
          </div>
          <div className="ospan-letter-grid">
            {LETTER_POOL.map((letter) => (
              <button
                key={letter}
                className={`btn btn-letter ${recalledLetters.includes(letter) ? "selected" : ""}`}
                onClick={() => onRecallLetter(letter)}
                disabled={recalledLetters.includes(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="ospan-recall-actions">
            <button
              className="btn btn-secondary"
              onClick={onUndoRecall}
              disabled={recalledLetters.length === 0}
            >
              取消
            </button>
            <button className="btn btn-primary" onClick={onConfirmRecall}>
              確定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
