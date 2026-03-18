import { useEffect } from "react";
import { saveGoNogoResult } from "../../db/repository.ts";
import { GoNogoResult } from "./GoNogoResult.tsx";
import { GoNogoRunner } from "./GoNogoRunner.tsx";
import { useGoNogo } from "./useGoNogo.ts";

export function GoNogoPage() {
  const gonogo = useGoNogo();

  useEffect(() => {
    if (gonogo.phase === "done" && gonogo.result) {
      saveGoNogoResult(gonogo.result);
    }
  }, [gonogo.phase, gonogo.result]);

  useEffect(() => {
    if (gonogo.phase === "fixation" || gonogo.phase === "stimulus") {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [gonogo.phase]);

  if (gonogo.phase === "idle") {
    return (
      <div className="task-page">
        <h1>Go/No-Go 課題</h1>
        <div className="task-description">
          <p>Go/No-Go課題は抑制制御（衝動抑制能力）を測定するテストです。</p>
          <ul>
            <li>総試行数: 80回（Go: 60回、No-Go: 20回）</li>
            <li>
              緑の丸（GO）が表示されたら、できるだけ早くクリックまたはスペースキーを押してください
            </li>
            <li>赤の丸（X）が表示されたら、反応しないでください</li>
            <li>各刺激は1.5秒で自動的に次へ進みます</li>
            <li>所要時間: 約3〜4分</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={gonogo.start}
          className="btn btn-primary btn-large"
        >
          テスト開始
        </button>
      </div>
    );
  }

  if (gonogo.phase === "done" && gonogo.result) {
    return (
      <div className="task-page">
        <GoNogoResult result={gonogo.result} />
      </div>
    );
  }

  return (
    <GoNogoRunner
      phase={gonogo.phase as "fixation" | "stimulus"}
      trialIndex={gonogo.trialIndex}
      currentType={gonogo.currentType}
      onRespond={gonogo.respond}
    />
  );
}
