import { computeSDRT } from "../tasks/pvt/pvt-logic.ts";
import { getAll, getByUid, put } from "./indexeddb.ts";
import type {
  CorsiResult,
  GoNogoResult,
  OSPANResult,
  PVTResult,
  TaskSwitchResult,
} from "./schema.ts";

export function savePVTResult(result: PVTResult): Promise<PVTResult> {
  result.uid ||= crypto.randomUUID();
  return put<PVTResult>("pvtResults", result);
}

export async function getPVTResultByUid(
  uid: string,
): Promise<PVTResult | undefined> {
  const result = await getByUid<PVTResult>("pvtResults", uid);
  if (result) {
    return { ...result, sdRT: result.sdRT ?? computeSDRT(result.trials) };
  }
  return undefined;
}

export async function getAllPVTResults(): Promise<PVTResult[]> {
  const results = await getAll<PVTResult>("pvtResults");
  return results.map((r) => ({
    ...r,
    sdRT: r.sdRT ?? computeSDRT(r.trials),
  }));
}

export function saveOSPANResult(result: OSPANResult): Promise<OSPANResult> {
  result.uid ||= crypto.randomUUID();
  return put<OSPANResult>("ospanResults", result);
}

export function getOSPANResultByUid(
  uid: string,
): Promise<OSPANResult | undefined> {
  return getByUid<OSPANResult>("ospanResults", uid);
}

export function getAllOSPANResults(): Promise<OSPANResult[]> {
  return getAll<OSPANResult>("ospanResults");
}

export function saveGoNogoResult(result: GoNogoResult): Promise<GoNogoResult> {
  result.uid ||= crypto.randomUUID();
  return put<GoNogoResult>("gonogoResults", result);
}

export function getGoNogoResultByUid(
  uid: string,
): Promise<GoNogoResult | undefined> {
  return getByUid<GoNogoResult>("gonogoResults", uid);
}

export function getAllGoNogoResults(): Promise<GoNogoResult[]> {
  return getAll<GoNogoResult>("gonogoResults");
}

export function saveCorsiResult(result: CorsiResult): Promise<CorsiResult> {
  result.uid ||= crypto.randomUUID();
  return put<CorsiResult>("corsiResults", result);
}

export function getCorsiResultByUid(
  uid: string,
): Promise<CorsiResult | undefined> {
  return getByUid<CorsiResult>("corsiResults", uid);
}

export function getAllCorsiResults(): Promise<CorsiResult[]> {
  return getAll<CorsiResult>("corsiResults");
}

export function saveTaskSwitchResult(
  result: TaskSwitchResult,
): Promise<TaskSwitchResult> {
  result.uid ||= crypto.randomUUID();
  return put<TaskSwitchResult>("taskswitchResults", result);
}

export function getTaskSwitchResultByUid(
  uid: string,
): Promise<TaskSwitchResult | undefined> {
  return getByUid<TaskSwitchResult>("taskswitchResults", uid);
}

export function getAllTaskSwitchResults(): Promise<TaskSwitchResult[]> {
  return getAll<TaskSwitchResult>("taskswitchResults");
}
