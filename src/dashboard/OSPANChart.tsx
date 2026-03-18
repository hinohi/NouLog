import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { OSPANResult } from "../db/schema.ts";

interface Props {
  results: OSPANResult[];
  xDomain?: [number, number];
  onPointClick?: (uid: string) => void;
}

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function OSPANChart({ results, xDomain, onPointClick }: Props) {
  if (results.length === 0) {
    return <p className="chart-empty">OSPAN の結果がまだありません</p>;
  }

  const data = results
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => ({
      timestamp: r.timestamp,
      uid: r.uid,
      absoluteScore: r.absoluteScore,
      partialScore: r.partialScore,
      mathAccuracy: Math.round(r.mathAccuracy * 100),
    }));

  return (
    <div className="chart-container">
      <h3>OSPAN スコア推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          onClick={(e) => {
            const uid = e?.activePayload?.[0]?.payload?.uid;
            if (uid && onPointClick) onPointClick(uid);
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={xDomain}
            tickFormatter={formatDate}
            stroke="#aaa"
            fontSize={12}
          />
          <YAxis yAxisId="score" stroke="#aaa" fontSize={12} width={65} />
          <YAxis
            yAxisId="pct"
            orientation="right"
            stroke="#aaa"
            fontSize={12}
            unit="%"
            domain={[0, 100]}
            width={50}
          />
          <Tooltip
            labelFormatter={formatDate}
            contentStyle={{ backgroundColor: "#333", border: "1px solid #555" }}
          />
          <Legend />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="absoluteScore"
            name="絶対スコア"
            stroke="#3498db"
            dot={{ r: 4, cursor: "pointer" }}
          />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="partialScore"
            name="部分スコア"
            stroke="#2ecc71"
            dot={{ r: 4, cursor: "pointer" }}
          />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="mathAccuracy"
            name="算数正答率"
            stroke="#e67e22"
            dot={{ r: 4, cursor: "pointer" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
