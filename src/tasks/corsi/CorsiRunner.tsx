import { BLOCK_POSITIONS } from "./corsi-logic.ts";

interface Props {
  phase: "watching" | "recalling" | "feedback";
  currentSpan: number;
  litBlock: number | null;
  userInput: number[];
  lastCorrect: boolean | null;
  onTap: (index: number) => void;
  onUndo: () => void;
}

export function CorsiRunner({
  phase,
  currentSpan,
  litBlock,
  userInput,
  lastCorrect,
  onTap,
  onUndo,
}: Props) {
  const tappable = phase === "recalling";

  const getBlockClass = (index: number): string => {
    const classes = ["corsi-block"];

    if (phase === "watching" && litBlock === index) {
      classes.push("lit");
    }

    if (phase === "feedback") {
      if (lastCorrect) {
        classes.push("correct");
      } else {
        classes.push("wrong");
      }
    }

    if (tappable) {
      classes.push("tappable");
    }

    const tapIndex = userInput.indexOf(index);
    if (tapIndex !== -1) {
      classes.push("tapped");
    }

    return classes.join(" ");
  };

  const getTapNumber = (index: number): number | null => {
    const tapIndex = userInput.indexOf(index);
    return tapIndex !== -1 ? tapIndex + 1 : null;
  };

  return (
    <div className="task-page">
      <div className="corsi-status">
        <span>スパン長: {currentSpan}</span>
      </div>
      <p className="corsi-instruction">
        {phase === "watching" && "シーケンスを覚えてください"}
        {phase === "recalling" &&
          `同じ順番でブロックをタップしてください (${userInput.length}/${currentSpan})`}
        {phase === "feedback" && (lastCorrect ? "正解!" : "不正解")}
      </p>
      <div className="corsi-board">
        {BLOCK_POSITIONS.map((pos, i) => {
          const tapNum = getTapNumber(i);
          return (
            <button
              key={`block-${pos.x}-${pos.y}`}
              type="button"
              className={getBlockClass(i)}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => tappable && onTap(i)}
              disabled={!tappable || userInput.includes(i)}
            >
              {tapNum !== null && (
                <span className="corsi-block-number">{tapNum}</span>
              )}
            </button>
          );
        })}
      </div>
      {phase === "recalling" && (
        <div className="corsi-recall-actions">
          <div className="corsi-input-progress">
            {Array.from({ length: currentSpan }, (_, i) => (
              <span
                key={`dot-${i}`}
                className={`corsi-input-dot ${i < userInput.length ? "filled" : ""}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onUndo}
            disabled={userInput.length === 0}
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
