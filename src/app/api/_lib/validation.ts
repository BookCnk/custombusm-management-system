import { BookingStatus, BusStatus, Prisma } from "@prisma/client";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isJsonValue(value: unknown): value is Prisma.InputJsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => isJsonValue(item));
  }

  if (isPlainObject(value)) {
    return Object.values(value).every((item) => isJsonValue(item));
  }

  return false;
}

export function normalizeNonEmptyString(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeOptionalString(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizePositiveInt(value: unknown) {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return undefined;
  }

  return value;
}

export function normalizeNonNegativeNumber(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return undefined;
  }

  return value;
}

export function normalizeDateInput(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? undefined : parsed;
}

export function isTimeString(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function isBusStatus(value: unknown): value is BusStatus {
  return value === BusStatus.active || value === BusStatus.maintenance;
}

export function isBookingStatus(value: unknown): value is BookingStatus {
  return value === BookingStatus.CONFIRMED || value === BookingStatus.CANCELLED;
}

export function normalizeJsonInput(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return Prisma.JsonNull;
  }

  return isJsonValue(value) ? value : undefined;
}

export function isObjectArray(
  value: unknown,
): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.every((item) => isPlainObject(item));
}
