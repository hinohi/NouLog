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

export function PVTChart({ results, xDomain, onPointClick }: Props) {
  if (results.length === 0) {
    return <p className="chart-empty">PVT の結果がまだありません</p>;
  }

  const data = results
    .sort((a, b) => a.timestamp - b.timestamp)
    .map((r) => ({
      timestamp: r.timestamp,
      uid: r.uid,
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
          margin={{ top: 5, right: 70, left: 10, bottom: 5 }}
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
          <YAxis stroke="#aaa" fontSize={12} unit=" ms" width={65} />
          <Tooltip
            labelFormatter={formatDate}
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
            dot={{ r: 4, cursor: "pointer" }}
          />
          <Line
            type="monotone"
            dataKey="medianRT"
            name="中央値RT"
            stroke="#2ecc71"
            dot={{ r: 4, cursor: "pointer" }}
          />
          <Line
            type="monotone"
            dataKey="sdRT"
            name="RT変動性(SD)"
            stroke="#e67e22"
            dot={{ r: 4, cursor: "pointer" }}
            strokeDasharray="4 2"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
