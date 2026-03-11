import { useEffect, useState } from "react";
import { exportAllData } from "../db/export.ts";
import { getAllOSPANResults, getAllPVTResults } from "../db/repository.ts";
import type { OSPANResult, PVTResult } from "../db/schema.ts";
import { OSPANChart } from "./OSPANChart.tsx";
import { PVTChart } from "./PVTChart.tsx";

export function DashboardPage() {
  const [pvtResults, setPvtResults] = useState<PVTResult[]>([]);
  const [ospanResults, setOspanResults] = useState<OSPANResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllPVTResults(), getAllOSPANResults()])
      .then(([pvt, ospan]) => {
        setPvtResults(pvt);
        setOspanResults(ospan);
      })
      .finally(() => setLoading(false));
  }, []);

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
      <PVTChart results={pvtResults} />
      <OSPANChart results={ospanResults} />
      <div className="export-section">
        <button
          type="button"
          className="btn btn-primary"
          onClick={exportAllData}
        >
          JSON エクスポート
        </button>
        <p className="export-note">
          PVT: {pvtResults.length} 件 / OSPAN: {ospanResults.length} 件
        </p>
      </div>
    </div>
  );
}
