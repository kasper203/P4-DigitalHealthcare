const crypto = require("node:crypto");
const ENC_KEY = Buffer.from(process.env.ENC_KEY, "base64");

if (ENC_KEY.length !== 32) {
  throw new Error("ENC_KEY must decode to exactly 32 bytes");
}

function encryptField(plaintext) {
  if (plaintext === null || plaintext === undefined) return null;

  const text = String(plaintext);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64"),
  });
}

function decryptField(payload) {
  if (payload === null || payload === undefined) return null;
  if (typeof payload !== 'string' || !payload.startsWith('{')) {
    return payload;
  }

  let parsed;

  try {
    parsed = JSON.parse(payload);
  } catch (err) {
    return payload;
  }

  if (!parsed.iv || !parsed.tag || !parsed.data) {
    return payload;
  }

  const iv = Buffer.from(parsed.iv, "base64");
  const tag = Buffer.from(parsed.tag, "base64");
  const encrypted = Buffer.from(parsed.data, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

module.exports = { encryptField, decryptField };