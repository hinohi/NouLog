import type { PVTResult as PVTResultType } from "../../db/schema.ts";

interface Props {
  result: PVTResultType;
  onRetry: () => void;
}

export function PVTResult({ result, onRetry }: Props) {
  return (
    <div className="pvt-result">
      <h2>PVT 結果</h2>
      <table className="result-table">
        <tbody>
          <tr>
            <td>平均反応時間</td>
            <td>{result.meanRT} ms</td>
          </tr>
          <tr>
            <td>中央値反応時間</td>
            <td>{result.medianRT} ms</td>
          </tr>
          <tr>
            <td>有効試行数</td>
            <td>{result.validTrialCount}</td>
          </tr>
          <tr>
            <td>ラプス数 (&gt;500ms)</td>
            <td>{result.lapseCount}</td>
          </tr>
          <tr>
            <td>フォルススタート数</td>
            <td>{result.falseStartCount}</td>
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
