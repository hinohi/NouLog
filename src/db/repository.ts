import { getAll, put } from "./indexeddb.ts";
import type { GoNogoResult, OSPANResult, PVTResult } from "./schema.ts";

export function savePVTResult(result: PVTResult): Promise<PVTResult> {
  return put<PVTResult>("pvtResults", result);
}

export function getAllPVTResults(): Promise<PVTResult[]> {
  return getAll<PVTResult>("pvtResults");
}

export function saveOSPANResult(result: OSPANResult): Promise<OSPANResult> {
  return put<OSPANResult>("ospanResults", result);
}

export function getAllOSPANResults(): Promise<OSPANResult[]> {
  return getAll<OSPANResult>("ospanResults");
}

export function saveGoNogoResult(result: GoNogoResult): Promise<GoNogoResult> {
  return put<GoNogoResult>("gonogoResults", result);
}

export function getAllGoNogoResults(): Promise<GoNogoResult[]> {
  return getAll<GoNogoResult>("gonogoResults");
}
