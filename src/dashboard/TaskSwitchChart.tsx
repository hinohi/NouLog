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
import type { TaskSwitchResult } from "../db/schema.ts";

interface Props {
  results: TaskSwitchResult[];
  xDomain?: [number, number];
}

const formatDate = (ts: number) =>
  new Date(ts).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function TaskSwitchChart({ results, xDomain }: Props) {
  if (results.length === 0) {
    return <p className="chart-empty">Task Switching の結果がまだありません</p>;
  }

  const sorted = [...results].sort((a, b) => a.timestamp - b.timestamp);

  const rtData = sorted.map((r) => ({
    timestamp: r.timestamp,
    switchCost: r.switchCost,
    switchMeanRT: r.switchMeanRT,
    repeatMeanRT: r.repeatMeanRT,
  }));

  const accData = sorted.map((r) => ({
    timestamp: r.timestamp,
    overall: Math.round(r.overallAccuracy * 100),
    switch: Math.round(r.switchAccuracy * 100),
    repeat: Math.round(r.repeatAccuracy * 100),
  }));

  return (
    <>
      <div className="chart-container">
        <h3>Task Switching スイッチコスト・RT推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={rtData}
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
            <YAxis stroke="#aaa" fontSize={12} unit=" ms" width={65} />
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
              dataKey="switchCost"
              name="スイッチコスト"
              stroke="#e74c3c"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="switchMeanRT"
              name="Switch RT"
              stroke="#e67e22"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="repeatMeanRT"
              name="Repeat RT"
              stroke="#3498db"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-container">
        <h3>Task Switching 正答率推移</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={accData}
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
            <YAxis
              stroke="#aaa"
              fontSize={12}
              unit="%"
              domain={[0, 100]}
              width={65}
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
              type="monotone"
              dataKey="overall"
              name="全体"
              stroke="#2ecc71"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="switch"
              name="Switch"
              stroke="#e67e22"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="repeat"
              name="Repeat"
              stroke="#3498db"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
