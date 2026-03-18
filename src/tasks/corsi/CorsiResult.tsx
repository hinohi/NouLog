import type { CorsiResult as CorsiResultType } from "../../db/schema.ts";

interface Props {
  result: CorsiResultType;
}

export function CorsiResult({ result }: Props) {
  return (
    <div className="corsi-result">
      <h2>Corsi Block 結果</h2>
      <table className="result-table">
        <tbody>
          <tr>
            <td>Block Span</td>
            <td>{result.blockSpan}</td>
          </tr>
          <tr>
            <td>Total Score</td>
            <td>{result.totalScore}</td>
          </tr>
          <tr>
            <td>正答数 / 総試行数</td>
            <td>
              {result.correctTrials} / {result.totalTrials}
            </td>
          </tr>
          <tr>
            <td>テスト時間</td>
            <td>{Math.round(result.durationMs / 1000)} 秒</td>
          </tr>
        </tbody>
      </table>
      <div className="result-actions">
        <a href="#/dashboard" className="btn btn-secondary">
          ダッシュボード
        </a>
      </div>
    </div>
  );
}
