import { COOKIE_NAME, JWT_SECRET } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { Player } from "../../drizzle/schema";
import * as db from "../db";
import crypto from "crypto";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type SessionPayload = {
  playerId: number;
  username: string;
  nickname: string;
};

class AuthService {
  private getSecretKey() {
    return new TextEncoder().encode(JWT_SECRET);
  }

  async hashPassword(password: string): Promise<string> {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  async createSessionToken(
    player: Player,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? 7 * 24 * 60 * 60 * 1000;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSecretKey();

    return new SignJWT({
      playerId: player.id,
      username: player.username,
      nickname: player.nickname,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .setIssuedAt(issuedAt)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSecretKey();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { playerId, username, nickname } = payload as Record<string, unknown>;

      if (
        !isNonEmptyString(username) ||
        !isNonEmptyString(nickname) ||
        typeof playerId !== 'number'
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return {
        playerId: playerId as number,
        username,
        nickname,
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<Player> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw new Error("Invalid session cookie");
    }

    const player = await db.getPlayerById(session.playerId);

    if (!player) {
      throw new Error("Player not found");
    }

    if (player.isDeleted === 'y') {
      throw new Error("Player account is deleted");
    }

    return player;
  }

  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
}

export const authService = new AuthService();
