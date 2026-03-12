import { useEffect } from "react";
import { TOTAL_TRIALS } from "./taskswitch-logic.ts";

interface Props {
  phase: "fixation" | "stimulus" | "feedback";
  trialIndex: number;
  currentTask: "parity" | "magnitude" | null;
  currentDigit: number | null;
  lastCorrect: boolean | null;
  onRespond: (side: "left" | "right") => void;
}

export function TaskSwitchRunner({
  phase,
  trialIndex,
  currentTask,
  currentDigit,
  lastCorrect,
  onRespond,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        onRespond("left");
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        onRespond("right");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onRespond]);

  const patternPosition = trialIndex % 4;

  return (
    <div className="taskswitch-runner">
      <div className="taskswitch-progress">
        試行 {trialIndex + 1} / {TOTAL_TRIALS}
      </div>
      <div className="taskswitch-pattern">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`taskswitch-pattern-dot ${i === patternPosition ? "active" : ""} ${i < 2 ? "parity" : "magnitude"}`}
          />
        ))}
      </div>
      <div className="taskswitch-task-label">
        {currentTask === "parity"
          ? "奇数 / 偶数？"
          : "5より小さい / 5より大きい？"}
      </div>
      <div className="taskswitch-stimulus">
        {phase === "fixation" ? (
          <span className="taskswitch-fixation">+</span>
        ) : phase === "stimulus" ? (
          <span className="taskswitch-digit">{currentDigit}</span>
        ) : (
          <span
            className={`taskswitch-feedback ${lastCorrect ? "correct" : "wrong"}`}
          >
            {lastCorrect ? "○" : "×"}
          </span>
        )}
      </div>
      <div className="taskswitch-buttons">
        <button
          type="button"
          className="btn taskswitch-btn left"
          onClick={() => onRespond("left")}
          disabled={phase !== "stimulus"}
        >
          {currentTask === "parity" ? "奇数" : "小さい"}
          <span className="taskswitch-key-hint">←</span>
        </button>
        <button
          type="button"
          className="btn taskswitch-btn right"
          onClick={() => onRespond("right")}
          disabled={phase !== "stimulus"}
        >
          {currentTask === "parity" ? "偶数" : "大きい"}
          <span className="taskswitch-key-hint">→</span>
        </button>
      </div>
    </div>
  );
}
