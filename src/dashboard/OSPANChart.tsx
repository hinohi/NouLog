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
}

export function OSPANChart({ results }: Props) {
  if (results.length === 0) {
    return <p className="chart-empty">OSPAN の結果がまだありません</p>;
  }

  const data = results
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => ({
      date: new Date(r.timestamp).toLocaleDateString("ja-JP", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
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
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#aaa" fontSize={12} />
          <YAxis yAxisId="score" stroke="#aaa" fontSize={12} />
          <YAxis
            yAxisId="pct"
            orientation="right"
            stroke="#aaa"
            fontSize={12}
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#333", border: "1px solid #555" }}
          />
          <Legend />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="absoluteScore"
            name="絶対スコア"
            stroke="#3498db"
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="partialScore"
            name="部分スコア"
            stroke="#2ecc71"
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="mathAccuracy"
            name="算数正答率"
            stroke="#e67e22"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
