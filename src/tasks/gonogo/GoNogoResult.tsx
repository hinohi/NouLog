import type { GoNogoResult as GoNogoResultType } from "../../db/schema.ts";

interface Props {
  result: GoNogoResultType;
  onRetry: () => void;
}

export function GoNogoResult({ result, onRetry }: Props) {
  return (
    <div className="gonogo-result">
      <h2>Go/No-Go 結果</h2>
      <table className="result-table">
        <tbody>
          <tr>
            <td>d&apos;（感度指標）</td>
            <td>{result.dPrime}</td>
          </tr>
          <tr>
            <td>Go正反応率</td>
            <td>{(result.goHitRate * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td>平均反応時間 (Go)</td>
            <td>{result.goMeanRT} ms</td>
          </tr>
          <tr>
            <td>中央値反応時間 (Go)</td>
            <td>{result.goMedianRT} ms</td>
          </tr>
          <tr>
            <td>誤反応率 (No-Go)</td>
            <td>{(result.falseAlarmRate * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <td>無反応率 (Go)</td>
            <td>{(result.omissionRate * 100).toFixed(1)}%</td>
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
