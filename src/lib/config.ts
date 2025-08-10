import type { Period } from "@/lib/tax";

export type AppConfig = {
  gross: string;
  period: Period;
  includeChurch: boolean;
  municipalityId: string;
  singleParent: boolean;
  commuteKm: string;
  workDays: string;
  atpSector: "private" | "public";
  atpHours: string;
  employeePensionRate: string;
  applyStoreBededag: boolean;
};

export const DEFAULT_CONFIG: AppConfig = {
  gross: "",
  period: "month",
  includeChurch: false,
  municipalityId: "koebenhavn",
  singleParent: false,
  commuteKm: "",
  workDays: "226",
  atpSector: "private",
  atpHours: "160",
  employeePensionRate: "",
  applyStoreBededag: true,
};

function coerceToAppConfig(value: unknown): AppConfig | null {
  if (typeof value !== "object" || value === null) return null;
  const data = value as Record<string, unknown>;
  const cfg: AppConfig = {
    gross: typeof data.gross === "string" ? data.gross : DEFAULT_CONFIG.gross,
    period:
      data.period === "year" || data.period === "month"
        ? (data.period as Period)
        : DEFAULT_CONFIG.period,
    includeChurch: Boolean(data.includeChurch),
    municipalityId:
      typeof data.municipalityId === "string"
        ? (data.municipalityId as string)
        : DEFAULT_CONFIG.municipalityId,
    singleParent: Boolean(data.singleParent),
    commuteKm:
      typeof data.commuteKm === "string"
        ? (data.commuteKm as string)
        : DEFAULT_CONFIG.commuteKm,
    workDays:
      typeof data.workDays === "string"
        ? (data.workDays as string)
        : DEFAULT_CONFIG.workDays,
    atpSector: data.atpSector === "public" ? "public" : "private",
    atpHours:
      typeof data.atpHours === "string"
        ? (data.atpHours as string)
        : DEFAULT_CONFIG.atpHours,
    employeePensionRate:
      typeof data.employeePensionRate === "string"
        ? (data.employeePensionRate as string)
        : DEFAULT_CONFIG.employeePensionRate,
    applyStoreBededag: (data.applyStoreBededag as boolean) !== false,
  };
  return cfg;
}

const STORAGE_KEY = "skattefar:lastConfig";

export function loadLastConfig(): AppConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return coerceToAppConfig(parsed);
  } catch {
    return null;
  }
}

export function saveLastConfig(cfg: AppConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    return true;
  } catch {
    return false;
  }
}

export function areConfigsEqual(a: AppConfig, b: AppConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function clearLastConfig(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
