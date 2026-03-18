import { useCallback, useEffect, useRef, useState } from "react";
import { exportAllData, importAllData } from "../db/export.ts";
import {
  getAllCorsiResults,
  getAllGoNogoResults,
  getAllOSPANResults,
  getAllPVTResults,
  getAllTaskSwitchResults,
} from "../db/repository.ts";
import type {
  CorsiResult,
  GoNogoResult,
  ImportResult,
  OSPANResult,
  PVTResult,
  TaskSwitchResult,
} from "../db/schema.ts";
import { CorsiChart } from "./CorsiChart.tsx";
import { GoNogoChart } from "./GoNogoChart.tsx";
import { OSPANChart } from "./OSPANChart.tsx";
import { PVTChart } from "./PVTChart.tsx";
import { TaskSwitchChart } from "./TaskSwitchChart.tsx";

export function DashboardPage() {
  const [pvtResults, setPvtResults] = useState<PVTResult[]>([]);
  const [ospanResults, setOspanResults] = useState<OSPANResult[]>([]);
  const [gonogoResults, setGonogoResults] = useState<GoNogoResult[]>([]);
  const [corsiResults, setCorsiResults] = useState<CorsiResult[]>([]);
  const [taskswitchResults, setTaskswitchResults] = useState<
    TaskSwitchResult[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      getAllPVTResults(),
      getAllOSPANResults(),
      getAllGoNogoResults(),
      getAllCorsiResults(),
      getAllTaskSwitchResults(),
    ])
      .then(([pvt, ospan, gonogo, corsi, taskswitch]) => {
        setPvtResults(pvt);
        setOspanResults(ospan);
        setGonogoResults(gonogo);
        setCorsiResults(corsi);
        setTaskswitchResults(taskswitch);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus("インポート中...");
    try {
      const result: ImportResult = await importAllData(file);
      const totalImported =
        result.pvt.imported +
        result.ospan.imported +
        result.gonogo.imported +
        result.corsi.imported +
        result.taskswitch.imported;
      const totalSkipped =
        result.pvt.skipped +
        result.ospan.skipped +
        result.gonogo.skipped +
        result.corsi.skipped +
        result.taskswitch.skipped;
      setImportStatus(
        `インポート完了: ${totalImported} 件追加, ${totalSkipped} 件スキップ`,
      );
      fetchData();
    } catch (err) {
      setImportStatus(
        `エラー: ${err instanceof Error ? err.message : "インポートに失敗しました"}`,
      );
    }
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const xDomain = (() => {
    const allTimestamps = [
      ...pvtResults.map((r) => r.timestamp),
      ...ospanResults.map((r) => r.timestamp),
      ...gonogoResults.map((r) => r.timestamp),
      ...corsiResults.map((r) => r.timestamp),
      ...taskswitchResults.map((r) => r.timestamp),
    ];
    if (allTimestamps.length === 0) return undefined;
    return [Math.min(...allTimestamps), Math.max(...allTimestamps)] as [
      number,
      number,
    ];
  })();

  const navigateToResult = (taskType: string) => (uid: string) => {
    window.location.hash = `#/result/${taskType}/${uid}`;
  };

  if (loading) {
    return (
      <div className="task-page">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="task-page">
      <h1>ダッシュボード</h1>
      <PVTChart
        results={pvtResults}
        xDomain={xDomain}
        onPointClick={navigateToResult("pvt")}
      />
      <OSPANChart
        results={ospanResults}
        xDomain={xDomain}
        onPointClick={navigateToResult("ospan")}
      />
      <GoNogoChart
        results={gonogoResults}
        xDomain={xDomain}
        onPointClick={navigateToResult("gonogo")}
      />
      <CorsiChart
        results={corsiResults}
        xDomain={xDomain}
        onPointClick={navigateToResult("corsi")}
      />
      <TaskSwitchChart
        results={taskswitchResults}
        xDomain={xDomain}
        onPointClick={navigateToResult("taskswitch")}
      />
      <div className="export-section">
        <button
          type="button"
          className="btn btn-primary"
          onClick={exportAllData}
        >
          JSON エクスポート
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleImport}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => fileInputRef.current?.click()}
        >
          JSON インポート
        </button>
        {importStatus && <p className="export-note">{importStatus}</p>}
        <p className="export-note">
          PVT: {pvtResults.length} 件 / OSPAN: {ospanResults.length} 件 /
          Go/No-Go: {gonogoResults.length} 件 / Corsi: {corsiResults.length} 件
          / Task Switching: {taskswitchResults.length} 件
        </p>
      </div>
    </div>
  );
}
