# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NouLog（認知パフォーマンス定点観測）は、認知機能テストをブラウザ上で実行し結果を記録するSPAアプリ。現在2種のテストを実装:
- **PVT** (精神運動覚醒テスト): 反応時間を3分間測定
- **OSPAN** (操作スパンテスト): ワーキングメモリ容量を測定（数学問題＋文字記憶）

## Commands

```bash
bun dev          # 開発サーバー起動 (HMR有効)
bun run build    # プロダクションビルド (dist/へ出力)
bun start        # プロダクション実行
bun run check    # Biome lint/format チェック
bun run fix      # Biome lint/format 自動修正
bun test         # テスト実行
```

## Tech Stack

- **Runtime/Bundler**: Bun (Node.jsではなくBunを使う)
- **Frontend**: React 19, TypeScript, Recharts (グラフ)
- **Linter/Formatter**: Biome (インデント: スペース2, ダブルクォート)
- **Server**: `Bun.serve()` でHTMLインポート方式 (Vite/express不使用)
- **DB**: ブラウザ IndexedDB (サーバーサイドDBなし)

## Architecture

- `src/index.ts` — Bunサーバーエントリポイント。`Bun.serve()`でHTMLをルーティング
- `src/frontend.tsx` — Reactエントリポイント (HMR対応)
- `src/App.tsx` — ハッシュベースルーティング (`useHashRoute`) でページ切替
- `src/tasks/{pvt,ospan}/` — 各テストのページ・ロジック・UIコンポーネント
  - `*-logic.ts` — 純粋なビジネスロジック (テスト可能、UIに依存しない)
  - `use*.ts` — React hooks (テスト実行状態管理)
  - `*Page.tsx` / `*Runner.tsx` / `*Result.tsx` — UIコンポーネント
- `src/dashboard/` — 結果一覧・グラフ表示
- `src/db/` — IndexedDBラッパー。`schema.ts`で型定義、`repository.ts`でCRUD、`export.ts`でJSONエクスポート
- `src/components/` — 共通UIコンポーネント
