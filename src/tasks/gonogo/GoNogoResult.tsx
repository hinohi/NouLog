import { useState } from "react";
import type { GoNogoResult as GoNogoResultType } from "../../db/schema.ts";

interface Props {
  result: GoNogoResultType;
}

export function GoNogoResult({ result }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div className="gonogo-result">
      <h2>Go/No-Go 結果</h2>
      <table className="result-table">
        <tbody>
          <tr>
            <td>
              d&apos;（感度指標）
              <button
                type="button"
                className="info-icon"
                onClick={() => setShowInfo(true)}
                aria-label="d'の説明を表示"
              >
                &#9432;
              </button>
            </td>
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
        <a href="#/dashboard" className="btn btn-secondary">
          ダッシュボード
        </a>
      </div>
      {showInfo && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowInfo(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowInfo(false);
          }}
        >
          {/* biome-ignore lint/a11y/noStaticElementInteractions: overlay click-away防止 */}
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <h3>d&apos;（ディープライム）とは</h3>
            <p>
              信号検出理論に基づく感度指標で、「Go刺激への正反応率」と「No-Go刺激への誤反応率」から算出されます。
            </p>
            <p>値が高いほど、GoとNo-Goを正確に区別できていることを示します。</p>
            <p className="info-scale">
              <strong>目安：</strong>1.0未満 = 低感度 / 1.0〜2.0 = 中程度 /
              2.0以上 = 高感度
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowInfo(false)}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
