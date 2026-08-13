import type { Entitlements } from "../access/config";

export interface UserRecord {
  id: string;
  email: string;
  firstName: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  entitlements: Entitlements;
}

export interface SessionRecord {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  entitlements: Entitlements;
  createdAt: string;
}

export const SESSION_KEY = "tejKaya.session";

export function toPublic(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    entitlements: user.entitlements,
    createdAt: user.createdAt
  };
}

export function persistClientSession(user: PublicUser, sessionId: string): void {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ sessionId, firstName: user.firstName, email: user.email, userId: user.id })
  );
}

export function readClientSession(): {
  sessionId: string;
  firstName: string;
  email: string;
  userId: string;
} | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as { sessionId: string; firstName: string; email: string; userId: string }) : null;
  } catch {
    return null;
  }
}

export function clearClientSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
