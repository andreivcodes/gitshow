import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 16;
const IV_LENGTH = 16;
const KEY_LENGTH = 32;

export function encryptToken(token: string, secret: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = scryptSync(secret, salt, KEY_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  const tag = cipher.getAuthTag();

  // Return: salt:iv:tag:encrypted
  return [salt.toString("hex"), iv.toString("hex"), tag.toString("hex"), encrypted].join(":");
}

export function decryptToken(encryptedData: string, secret: string): string {
  const [saltHex, ivHex, tagHex, encrypted] = encryptedData.split(":");

  if (!saltHex || !ivHex || !tagHex || !encrypted) {
    throw new Error("Invalid encrypted token format");
  }

  const salt = Buffer.from(saltHex, "hex");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const key = scryptSync(secret, salt, KEY_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
