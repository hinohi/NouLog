import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PVTResult } from "../db/schema.ts";

interface Props {
  results: PVTResult[];
}

export function PVTChart({ results }: Props) {
  if (results.length === 0) {
    return <p className="chart-empty">PVT の結果がまだありません</p>;
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
      meanRT: r.meanRT,
      medianRT: r.medianRT,
      sdRT: r.sdRT,
    }));

  return (
    <div className="chart-container">
      <h3>PVT 反応時間推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#aaa" fontSize={12} />
          <YAxis stroke="#aaa" fontSize={12} unit=" ms" />
          <Tooltip
            contentStyle={{ backgroundColor: "#333", border: "1px solid #555" }}
          />
          <Legend />
          <ReferenceLine
            y={500}
            stroke="#e74c3c"
            strokeDasharray="5 5"
            label="ラプス閾値"
          />
          <Line
            type="monotone"
            dataKey="meanRT"
            name="平均RT"
            stroke="#3498db"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="medianRT"
            name="中央値RT"
            stroke="#2ecc71"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="sdRT"
            name="RT変動性(SD)"
            stroke="#e67e22"
            dot={{ r: 4 }}
            strokeDasharray="4 2"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
