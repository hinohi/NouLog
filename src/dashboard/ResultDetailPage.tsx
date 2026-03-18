import { useEffect, useState } from "react";
import {
  getCorsiResultByUid,
  getGoNogoResultByUid,
  getOSPANResultByUid,
  getPVTResultByUid,
  getTaskSwitchResultByUid,
} from "../db/repository.ts";
import type {
  CorsiResult,
  GoNogoResult,
  OSPANResult,
  PVTResult,
  TaskSwitchResult,
} from "../db/schema.ts";
import { CorsiResult as CorsiResultView } from "../tasks/corsi/CorsiResult.tsx";
import { GoNogoResult as GoNogoResultView } from "../tasks/gonogo/GoNogoResult.tsx";
import { OSPANResult as OSPANResultView } from "../tasks/ospan/OSPANResult.tsx";
import { PVTResult as PVTResultView } from "../tasks/pvt/PVTResult.tsx";
import { TaskSwitchResult as TaskSwitchResultView } from "../tasks/taskswitch/TaskSwitchResult.tsx";

type AnyResult =
  | PVTResult
  | OSPANResult
  | GoNogoResult
  | CorsiResult
  | TaskSwitchResult;

const TASK_TYPES: Record<
  string,
  { fetch: (uid: string) => Promise<AnyResult | undefined>; route: string }
> = {
  pvt: { fetch: getPVTResultByUid, route: "#/pvt" },
  ospan: { fetch: getOSPANResultByUid, route: "#/ospan" },
  gonogo: { fetch: getGoNogoResultByUid, route: "#/gonogo" },
  corsi: { fetch: getCorsiResultByUid, route: "#/corsi" },
  taskswitch: { fetch: getTaskSwitchResultByUid, route: "#/taskswitch" },
};

interface Props {
  taskType: string;
  uid: string;
}

export function ResultDetailPage({ taskType, uid }: Props) {
  const [result, setResult] = useState<AnyResult | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const task = TASK_TYPES[taskType];
    if (!task) {
      setError(`不明なテストタイプ: ${taskType}`);
      setLoading(false);
      return;
    }
    task
      .fetch(uid)
      .then((r) => {
        setResult(r);
        if (!r) setError("結果が見つかりませんでした");
      })
      .catch(() => setError("データの読み込みに失敗しました"))
      .finally(() => setLoading(false));
  }, [taskType, uid]);

  if (loading) {
    return (
      <div className="task-page">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="task-page">
        <h1>結果詳細</h1>
        <p>{error}</p>
        <a href="#/dashboard" className="btn btn-secondary">
          ダッシュボードに戻る
        </a>
      </div>
    );
  }

  switch (taskType) {
    case "pvt":
      return <PVTResultView result={result as PVTResult} />;
    case "ospan":
      return <OSPANResultView result={result as OSPANResult} />;
    case "gonogo":
      return <GoNogoResultView result={result as GoNogoResult} />;
    case "corsi":
      return <CorsiResultView result={result as CorsiResult} />;
    case "taskswitch":
      return <TaskSwitchResultView result={result as TaskSwitchResult} />;
    default:
      return null;
  }
}
