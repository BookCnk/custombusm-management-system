import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export function jsonError(
  error: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error, ...extra }, { status });
}

export function parsePositiveInt(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function parseOptionalPositiveInt(value: string | null) {
  if (value === null) {
    return undefined;
  }

  return parsePositiveInt(value);
}

export function prismaErrorCode(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }

  return undefined;
}
