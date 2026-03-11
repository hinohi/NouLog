import { importToStore } from "./indexeddb.ts";
import {
  getAllCorsiResults,
  getAllGoNogoResults,
  getAllOSPANResults,
  getAllPVTResults,
} from "./repository.ts";
import type {
  CorsiResult,
  GoNogoResult,
  ImportResult,
  OSPANResult,
  PVTResult,
} from "./schema.ts";

export async function exportAllData(): Promise<void> {
  const [pvtResults, ospanResults, gonogoResults, corsiResults] =
    await Promise.all([
      getAllPVTResults(),
      getAllOSPANResults(),
      getAllGoNogoResults(),
      getAllCorsiResults(),
    ]);

  const data = {
    exportedAt: new Date().toISOString(),
    pvtResults,
    ospanResults,
    gonogoResults,
    corsiResults,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `noulog-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importAllData(file: File): Promise<ImportResult> {
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      "JSONの解析に失敗しました。有効なJSONファイルを選択してください。",
    );
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("不正なデータ形式です。");
  }

  const obj = data as Record<string, unknown>;

  const pvtRecords = Array.isArray(obj.pvtResults) ? obj.pvtResults : [];
  const ospanRecords = Array.isArray(obj.ospanResults) ? obj.ospanResults : [];
  const gonogoRecords = Array.isArray(obj.gonogoResults)
    ? obj.gonogoResults
    : [];
  const corsiRecords = Array.isArray(obj.corsiResults) ? obj.corsiResults : [];

  const [pvt, ospan, gonogo, corsi] = await Promise.all([
    importToStore<PVTResult>("pvtResults", pvtRecords),
    importToStore<OSPANResult>("ospanResults", ospanRecords),
    importToStore<GoNogoResult>("gonogoResults", gonogoRecords),
    importToStore<CorsiResult>("corsiResults", corsiRecords),
  ]);

  return { pvt, ospan, gonogo, corsi };
}
