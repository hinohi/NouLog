import { getAll, put } from "./indexeddb.ts";
import type { OSPANResult, PVTResult } from "./schema.ts";

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
