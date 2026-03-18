import { useEffect } from "react";
import { saveCorsiResult } from "../../db/repository.ts";
import { CorsiResult } from "./CorsiResult.tsx";
import { CorsiRunner } from "./CorsiRunner.tsx";
import { useCorsi } from "./useCorsi.ts";

export function CorsiPage() {
  const corsi = useCorsi();

  useEffect(() => {
    if (corsi.phase === "done" && corsi.result) {
      saveCorsiResult(corsi.result);
    }
  }, [corsi.phase, corsi.result]);

  useEffect(() => {
    if (
      corsi.phase === "watching" ||
      corsi.phase === "recalling" ||
      corsi.phase === "feedback"
    ) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [corsi.phase]);

  if (corsi.phase === "idle") {
    return (
      <div className="task-page">
        <h1>Corsi Block-Tapping 課題</h1>
        <div className="task-description">
          <p>Corsi Block課題は空間的ワーキングメモリを測定するテストです。</p>
          <ul>
            <li>画面上の9個のブロックが順番に点灯します</li>
            <li>点灯した順番通りにブロックをタップしてください</li>
            <li>正解するとスパン長が1つ増えます</li>
            <li>各スパン長で2試行あり、2試行とも不正解で終了です</li>
            <li>初期スパン長: 2、最大: 9</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={corsi.start}
          className="btn btn-primary btn-large"
        >
          テスト開始
        </button>
      </div>
    );
  }

  if (corsi.phase === "done" && corsi.result) {
    return (
      <div className="task-page">
        <CorsiResult result={corsi.result} />
      </div>
    );
  }

  return (
    <CorsiRunner
      phase={corsi.phase as "watching" | "recalling" | "feedback"}
      currentSpan={corsi.currentSpan}
      litBlock={corsi.litBlock}
      userInput={corsi.userInput}
      lastCorrect={corsi.lastCorrect}
      onTap={corsi.tapBlock}
      onUndo={corsi.undoTap}
    />
  );
}
