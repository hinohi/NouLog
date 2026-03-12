import type { TaskSwitchResult as TaskSwitchResultType } from "../../db/schema.ts";

interface Props {
  result: TaskSwitchResultType;
  onRetry: () => void;
}

export function TaskSwitchResult({ result, onRetry }: Props) {
  return (
    <div className="taskswitch-result">
      <h2>Task Switching 結果</h2>
      <table className="result-table">
        <tbody>
          <tr>
            <td>スイッチコスト</td>
            <td>{result.switchCost} ms</td>
          </tr>
          <tr>
            <td>Switch 平均RT</td>
            <td>{result.switchMeanRT} ms</td>
          </tr>
          <tr>
            <td>Repeat 平均RT</td>
            <td>{result.repeatMeanRT} ms</td>
          </tr>
          <tr>
            <td>全体平均RT</td>
            <td>{result.overallMeanRT} ms</td>
          </tr>
          <tr>
            <td>全体正答率</td>
            <td>{(result.overallAccuracy * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td>Switch正答率</td>
            <td>{(result.switchAccuracy * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td>Repeat正答率</td>
            <td>{(result.repeatAccuracy * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td>タイムアウト数</td>
            <td>{result.timeoutCount}</td>
          </tr>
          <tr>
            <td>テスト時間</td>
            <td>{Math.round(result.durationMs / 1000)} 秒</td>
          </tr>
        </tbody>
      </table>
      <div className="result-actions">
        <button type="button" onClick={onRetry} className="btn btn-primary">
          もう一度
        </button>
        <a href="#/dashboard" className="btn btn-secondary">
          ダッシュボード
        </a>
      </div>
    </div>
  );
}
