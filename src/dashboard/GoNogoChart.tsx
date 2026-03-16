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
  xDomain?: [number, number];
}

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function GoNogoChart({ results, xDomain }: Props) {
  if (results.length === 0) {
    return <p className="chart-empty">Go/No-Go の結果がまだありません</p>;
  }

  const sorted = [...results].sort((a, b) => a.timestamp - b.timestamp);

  const dPrimeData = sorted.map((r) => ({
    timestamp: r.timestamp,
    dPrime: r.dPrime,
  }));

  const rtFaData = sorted.map((r) => ({
    timestamp: r.timestamp,
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
            margin={{ top: 5, right: 70, left: 10, bottom: 5 }}
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
            <YAxis stroke="#aaa" fontSize={12} width={65} />
            <Tooltip
              labelFormatter={formatDate}
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
            <XAxis
              dataKey="timestamp"
              type="number"
              scale="time"
              domain={xDomain}
              tickFormatter={formatDate}
              stroke="#aaa"
              fontSize={12}
            />
            <YAxis
              yAxisId="left"
              stroke="#aaa"
              fontSize={12}
              unit=" ms"
              width={65}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#aaa"
              fontSize={12}
              unit="%"
              domain={[0, 100]}
              width={50}
            />
            <Tooltip
              labelFormatter={formatDate}
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
