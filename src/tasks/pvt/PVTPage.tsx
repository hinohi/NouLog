import { useEffect } from "react";
import { savePVTResult } from "../../db/repository.ts";
import { PVTResult } from "./PVTResult.tsx";
import { PVTRunner } from "./PVTRunner.tsx";
import { usePVT } from "./usePVT.ts";

export function PVTPage() {
  const pvt = usePVT();

  useEffect(() => {
    if (pvt.phase === "done" && pvt.result) {
      savePVTResult(pvt.result);
    }
  }, [pvt.phase, pvt.result]);

  useEffect(() => {
    if (pvt.phase === "waiting" || pvt.phase === "stimulus") {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [pvt.phase]);

  if (pvt.phase === "idle") {
    return (
      <div className="task-page">
        <h1>PVT - 精神運動覚醒テスト</h1>
        <div className="task-description">
          <p>
            PVT (Psychomotor Vigilance Task)
            は注意力と反応時間を測定するテストです。
          </p>
          <ul>
            <li>テスト時間: 3分間</li>
            <li>
              画面に赤い丸が表示されたら、できるだけ早くクリックまたはスペースキーを押してください
            </li>
            <li>
              赤い丸が表示される前にクリックするとフォルススタートになります
            </li>
            <li>反応時間が500msを超えるとラプス(注意低下)として記録されます</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={pvt.start}
          className="btn btn-primary btn-large"
        >
          テスト開始
        </button>
      </div>
    );
  }

  if (pvt.phase === "done" && pvt.result) {
    return (
      <div className="task-page">
        <PVTResult result={pvt.result} onRetry={pvt.start} />
      </div>
    );
  }

  return (
    <PVTRunner
      phase={pvt.phase as "waiting" | "stimulus"}
      elapsedMs={pvt.elapsedMs}
      onRespond={pvt.respond}
    />
  );
}
