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
import type { GoNogoResult } from "../db/schema.ts";

interface Props {
  results: GoNogoResult[];
}

export function GoNogoChart({ results }: Props) {
  if (results.length === 0) {
    return <p className="chart-empty">Go/No-Go の結果がまだありません</p>;
  }

  const sorted = [...results].sort((a, b) => a.timestamp - b.timestamp);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const dPrimeData = sorted.map((r) => ({
    date: formatDate(r.timestamp),
    dPrime: r.dPrime,
  }));

  const rtFaData = sorted.map((r) => ({
    date: formatDate(r.timestamp),
    goMeanRT: r.goMeanRT,
    falseAlarmRate: Math.round(r.falseAlarmRate * 100),
  }));

  return (
    <>
      <div className="chart-container">
        <h3>Go/No-Go d&apos;（感度指標）推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={dPrimeData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#aaa" fontSize={12} />
            <YAxis stroke="#aaa" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#333",
                border: "1px solid #555",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="dPrime"
              name="d'"
              stroke="#9b59b6"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-container">
        <h3>Go/No-Go 反応時間・誤反応率推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={rtFaData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#aaa" fontSize={12} />
            <YAxis yAxisId="left" stroke="#aaa" fontSize={12} unit=" ms" />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#aaa"
              fontSize={12}
              unit="%"
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
              dataKey="goMeanRT"
              name="Go平均RT"
              stroke="#3498db"
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="falseAlarmRate"
              name="誤反応率(%)"
              stroke="#e74c3c"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
