import {
  getAllGoNogoResults,
  getAllOSPANResults,
  getAllPVTResults,
} from "./repository.ts";

export async function exportAllData(): Promise<void> {
  const [pvtResults, ospanResults, gonogoResults] = await Promise.all([
    getAllPVTResults(),
    getAllOSPANResults(),
    getAllGoNogoResults(),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    pvtResults,
    ospanResults,
    gonogoResults,
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
