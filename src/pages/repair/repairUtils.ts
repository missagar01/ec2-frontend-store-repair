export type UnknownRecord = Record<string, unknown>;

export function toRecordArray(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) {
    return value as UnknownRecord[];
  }

  if (typeof value === "object" && value !== null) {
    const data = (value as { data?: unknown }).data;
    if (Array.isArray(data)) {
      return data as UnknownRecord[];
    }
  }

  return [];
}

export function stringFrom(value: unknown, fallback = ""): string {
  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }
  return fallback;
}

export function numberFrom(value: unknown, fallback = 0): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
}
