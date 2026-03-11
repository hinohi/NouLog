import { useEffect } from "react";
import { GONOGO_TOTAL_TRIALS } from "./gonogo-logic.ts";

interface Props {
  phase: "fixation" | "stimulus";
  trialIndex: number;
  currentType: "go" | "nogo" | null;
  onRespond: () => void;
}

export function GoNogoRunner({
  phase,
  trialIndex,
  currentType,
  onRespond,
}: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        onRespond();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onRespond]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled via global window listener
    // biome-ignore lint/a11y/useSemanticElements: intentional full-screen click area
    <div
      className="gonogo-runner"
      role="button"
      tabIndex={0}
      onClick={onRespond}
    >
      <div className="gonogo-progress">
        試行 {trialIndex + 1} / {GONOGO_TOTAL_TRIALS}
      </div>
      {phase === "fixation" ? (
        <div className="gonogo-fixation">+</div>
      ) : (
        <div
          className={`gonogo-circle ${currentType === "go" ? "go" : "nogo"}`}
        >
          <span className="gonogo-circle-label">
            {currentType === "go" ? "GO" : "X"}
          </span>
        </div>
      )}
      <p className="gonogo-instruction">
        {phase === "fixation"
          ? "中央の + を見てお待ちください"
          : currentType === "go"
            ? "GO → クリック!"
            : "X → 押さないで!"}
      </p>
    </div>
  );
}
