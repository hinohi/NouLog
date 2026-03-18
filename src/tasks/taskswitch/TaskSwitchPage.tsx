import { useEffect } from "react";
import { saveTaskSwitchResult } from "../../db/repository.ts";
import { TaskSwitchResult } from "./TaskSwitchResult.tsx";
import { TaskSwitchRunner } from "./TaskSwitchRunner.tsx";
import { useTaskSwitch } from "./useTaskSwitch.ts";

export function TaskSwitchPage() {
  const ts = useTaskSwitch();

  useEffect(() => {
    if (ts.phase === "done" && ts.result) {
      saveTaskSwitchResult(ts.result);
    }
  }, [ts.phase, ts.result]);

  useEffect(() => {
    if (
      ts.phase === "fixation" ||
      ts.phase === "stimulus" ||
      ts.phase === "feedback"
    ) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [ts.phase]);

  if (ts.phase === "idle") {
    return (
      <div className="task-page">
        <h1>Task Switching 課題</h1>
        <div className="task-description">
          <p>
            Task
            Switching課題は認知的柔軟性（セットシフティング）を測定するテストです。
          </p>
          <ul>
            <li>総試行数: 64回（AABB交替パターン）</li>
            <li>
              2つのタスクが交互に切り替わります:
              <br />
              奇偶判断（奇数/偶数）→ 大小判断（5より小さい/大きい）
            </li>
            <li>
              左キー/左ボタン = 奇数 or 小さい
              <br />
              右キー/右ボタン = 偶数 or 大きい
            </li>
            <li>各刺激は3秒でタイムアウトします</li>
            <li>所要時間: 約4〜5分</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={ts.start}
          className="btn btn-primary btn-large"
        >
          テスト開始
        </button>
      </div>
    );
  }

  if (ts.phase === "done" && ts.result) {
    return (
      <div className="task-page">
        <TaskSwitchResult result={ts.result} />
      </div>
    );
  }

  return (
    <TaskSwitchRunner
      phase={ts.phase as "fixation" | "stimulus" | "feedback"}
      trialIndex={ts.trialIndex}
      currentTask={ts.currentTask}
      currentDigit={ts.currentDigit}
      lastCorrect={ts.lastCorrect}
      onRespond={ts.respond}
    />
  );
}
