import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const PASSWORD_HASH_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;

function normalizePassword(value: string) {
  return value.normalize("NFKC");
}

function isPasswordHash(value: string) {
  return value.startsWith(`${PASSWORD_HASH_PREFIX}$`);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(normalizePassword(password), salt, SCRYPT_KEY_LENGTH)) as Buffer;

  return `${PASSWORD_HASH_PREFIX}$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, storedPassword: string) {
  if (!isPasswordHash(storedPassword)) {
    return normalizePassword(password) === storedPassword;
  }

  const [, salt, hashedValue] = storedPassword.split("$");

  if (!salt || !hashedValue) {
    return false;
  }

  const derivedKey = (await scrypt(normalizePassword(password), salt, SCRYPT_KEY_LENGTH)) as Buffer;
  const storedKey = Buffer.from(hashedValue, "hex");

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
}

export function needsPasswordRehash(storedPassword: string) {
  return !isPasswordHash(storedPassword);
}
