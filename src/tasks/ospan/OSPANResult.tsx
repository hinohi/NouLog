import type { OSPANResult as OSPANResultType } from "../../db/schema.ts";

interface Props {
  result: OSPANResultType;
  onRetry: () => void;
}

export function OSPANResult({ result, onRetry }: Props) {
  return (
    <div className="ospan-result">
      <h2>OSPAN 結果</h2>
      <table className="result-table">
        <tbody>
          <tr>
            <td>絶対スコア</td>
            <td>
              {result.absoluteScore} / {result.totalLetters}
            </td>
          </tr>
          <tr>
            <td>部分スコア</td>
            <td>
              {result.partialScore} / {result.totalLetters}
            </td>
          </tr>
          <tr>
            <td>算数正答率</td>
            <td>{Math.round(result.mathAccuracy * 100)}%</td>
          </tr>
          <tr>
            <td>算数問題数</td>
            <td>{result.totalMathProblems}</td>
          </tr>
          <tr>
            <td>セット数</td>
            <td>{result.sets.length}</td>
          </tr>
        </tbody>
      </table>
      <h3>セット別詳細</h3>
      <table className="result-table detail-table">
        <thead>
          <tr>
            <th>サイズ</th>
            <th>文字</th>
            <th>回答</th>
            <th>正解数</th>
            <th>完全正答</th>
          </tr>
        </thead>
        <tbody>
          {result.sets.map((set, i) => (
            <tr key={i}>
              <td>{set.setSize}</td>
              <td>{set.letters.join(" ")}</td>
              <td>{set.recalledLetters.join(" ")}</td>
              <td>{set.correctLetterCount}</td>
              <td>{set.perfectRecall ? "O" : "X"}</td>
            </tr>
          ))}
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
