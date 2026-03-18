import { useEffect } from "react";
import { saveOSPANResult } from "../../db/repository.ts";
import { OSPANResult } from "./OSPANResult.tsx";
import { OSPANRunner } from "./OSPANRunner.tsx";
import { useOSPAN } from "./useOSPAN.ts";

export function OSPANPage() {
  const ospan = useOSPAN();

  useEffect(() => {
    if (ospan.phase === "done" && ospan.result) {
      saveOSPANResult(ospan.result);
    }
  }, [ospan.phase, ospan.result]);

  useEffect(() => {
    if (
      ospan.phase === "math" ||
      ospan.phase === "showLetter" ||
      ospan.phase === "recall"
    ) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [ospan.phase]);

  if (ospan.phase === "idle") {
    return (
      <div className="task-page">
        <h1>OSPAN - 操作スパンテスト</h1>
        <div className="task-description">
          <p>
            OSPAN (Operation Span) はワーキングメモリ容量を測定するテストです。
          </p>
          <ul>
            <li>算数問題に答えた後、表示される文字を覚えてください</li>
            <li>セットの最後に、覚えた文字を順番通りに入力してください</li>
            <li>セットサイズ: 3〜7文字 (各3セット、計15セット)</li>
            <li>算数の正答率が低すぎるとテストの信頼性が低下します</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={ospan.start}
          className="btn btn-primary btn-large"
        >
          テスト開始
        </button>
      </div>
    );
  }

  if (ospan.phase === "done" && ospan.result) {
    return (
      <div className="task-page">
        <OSPANResult result={ospan.result} />
      </div>
    );
  }

  return (
    <OSPANRunner
      phase={ospan.phase as "math" | "showLetter" | "recall"}
      currentSetIndex={ospan.currentSetIndex}
      totalSets={ospan.totalSets}
      currentSetSize={ospan.currentSetSize}
      currentItemIndex={ospan.currentItemIndex}
      currentLetter={ospan.currentLetter}
      currentMathProblem={ospan.currentMathProblem}
      recalledLetters={ospan.recalledLetters}
      onAnswerMath={ospan.answerMath}
      onRecallLetter={ospan.recallLetter}
      onUndoRecall={ospan.undoRecall}
      onConfirmRecall={ospan.confirmRecall}
    />
  );
}
