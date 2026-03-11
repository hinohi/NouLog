import { getAll, put } from "./indexeddb.ts";
import type {
  CorsiResult,
  GoNogoResult,
  OSPANResult,
  PVTResult,
} from "./schema.ts";

export function savePVTResult(result: PVTResult): Promise<PVTResult> {
  result.uid ||= crypto.randomUUID();
  return put<PVTResult>("pvtResults", result);
}

export function getAllPVTResults(): Promise<PVTResult[]> {
  return getAll<PVTResult>("pvtResults");
}

export function saveOSPANResult(result: OSPANResult): Promise<OSPANResult> {
  result.uid ||= crypto.randomUUID();
  return put<OSPANResult>("ospanResults", result);
}

export function getAllOSPANResults(): Promise<OSPANResult[]> {
  return getAll<OSPANResult>("ospanResults");
}

export function saveGoNogoResult(result: GoNogoResult): Promise<GoNogoResult> {
  result.uid ||= crypto.randomUUID();
  return put<GoNogoResult>("gonogoResults", result);
}

export function getAllGoNogoResults(): Promise<GoNogoResult[]> {
  return getAll<GoNogoResult>("gonogoResults");
}

export function saveCorsiResult(result: CorsiResult): Promise<CorsiResult> {
  result.uid ||= crypto.randomUUID();
  return put<CorsiResult>("corsiResults", result);
}

export function getAllCorsiResults(): Promise<CorsiResult[]> {
  return getAll<CorsiResult>("corsiResults");
}
