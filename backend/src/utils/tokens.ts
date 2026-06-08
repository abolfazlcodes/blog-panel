import crypto from "node:crypto";
import jwt from "jsonwebtoken";

import {
  ACCESS_TOKEN_EXPIRY_TIME,
  REFRESH_TOKEN_EXPIRY_MS,
} from "../configs/constants.js";
import prisma from "../prisma.js";

/** Signs a short-lived access JWT and returns it with its expiry. */
export function createAccessToken(user: { id: number; email: string }) {
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET_KEY!,
    { expiresIn: ACCESS_TOKEN_EXPIRY_TIME, algorithm: "HS256" }
  );
  const expiresAt = new Date(Date.now() + ACCESS_TOKEN_EXPIRY_TIME * 1000);
  return { token, expiresAt };
}

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Creates and persists a new refresh token (only its hash is stored) and
 * returns the plaintext token + expiry to hand back to the client.
 */
export async function issueRefreshToken(userId: number) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  await prisma.refreshToken.create({
    data: { token_hash: hashToken(token), userId, expires_at: expiresAt },
  });
  return { token, expiresAt };
}

/**
 * Validates a refresh token and consumes it (single-use rotation): the
 * presented token is always deleted. Returns the owning userId, or null if the
 * token is unknown/expired.
 */
export async function consumeRefreshToken(token: string): Promise<number | null> {
  const record = await prisma.refreshToken.findUnique({
    where: { token_hash: hashToken(token) },
  });
  if (!record) return null;

  await prisma.refreshToken.delete({ where: { id: record.id } }).catch(() => {});

  if (record.expires_at.getTime() < Date.now()) return null;
  return record.userId;
}

/** Revokes a refresh token (logout). No-op if it doesn't exist. */
export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token_hash: hashToken(token) } });
}
