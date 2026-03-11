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
import type { CorsiResult } from "../db/schema.ts";

interface Props {
  results: CorsiResult[];
}

export function CorsiChart({ results }: Props) {
  if (results.length === 0) {
    return <p className="chart-empty">Corsi Block の結果がまだありません</p>;
  }

  const sorted = [...results].sort((a, b) => a.timestamp - b.timestamp);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const data = sorted.map((r) => ({
    date: formatDate(r.timestamp),
    blockSpan: r.blockSpan,
    totalScore: r.totalScore,
  }));

  return (
    <div className="chart-container">
      <h3>Corsi Block Span・Total Score 推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#aaa" fontSize={12} />
          <YAxis yAxisId="left" stroke="#aaa" fontSize={12} />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#aaa"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#333",
              border: "1px solid #555",
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="blockSpan"
            name="Block Span"
            stroke="#e67e22"
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="totalScore"
            name="Total Score"
            stroke="#1abc9c"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
