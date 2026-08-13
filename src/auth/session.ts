import { defaultEntitlements } from "../access/config";
import { hashPassword, randomHex, timingSafeEqual, uid } from "../lib/crypto";
import { idbDelete, idbGet, idbGetByIndex, idbPut } from "../store/idb";
import {
  clearClientSession,
  persistClientSession,
  readClientSession,
  toPublic,
  type PublicUser,
  type SessionRecord,
  type UserRecord
} from "./types";

const SESSION_MS = 1000 * 60 * 60 * 24 * 30;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function register(input: {
  firstName: string;
  email: string;
  password: string;
}): Promise<PublicUser> {
  const email = normalizeEmail(input.email);
  if (!email || !input.firstName.trim() || input.password.length < 8) {
    throw new Error("Please enter your name, a valid email, and a password of at least 8 characters.");
  }
  const existing = await idbGetByIndex<UserRecord>("users", "email", email);
  if (existing) throw new Error("An account with this email already exists. Sign in instead.");
  const salt = randomHex(16);
  const passwordHash = await hashPassword(input.password, salt);
  const user: UserRecord = {
    id: uid("usr"),
    email,
    firstName: input.firstName.trim(),
    passwordSalt: salt,
    passwordHash,
    createdAt: new Date().toISOString(),
    entitlements: { ...defaultEntitlements }
  };
  await idbPut("users", user);
  await createSession(user);
  return toPublic(user);
}

export async function signIn(email: string, password: string): Promise<PublicUser> {
  const user = await idbGetByIndex<UserRecord>("users", "email", normalizeEmail(email));
  if (!user) throw new Error("We could not find that email. Create an account to begin.");
  const hash = await hashPassword(password, user.passwordSalt);
  if (!timingSafeEqual(hash, user.passwordHash)) throw new Error("That password does not match our records.");
  await createSession(user);
  return toPublic(user);
}

async function createSession(user: UserRecord): Promise<void> {
  const session: SessionRecord = {
    id: uid("ses"),
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_MS).toISOString()
  };
  await idbPut("sessions", session);
  persistClientSession(toPublic(user), session.id);
}

export async function currentUser(): Promise<PublicUser | null> {
  const client = readClientSession();
  if (!client) return null;
  const session = await idbGet<SessionRecord>("sessions", client.sessionId);
  if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
    await signOut();
    return null;
  }
  const user = await idbGet<UserRecord>("users", session.userId);
  if (!user) {
    await signOut();
    return null;
  }
  persistClientSession(toPublic(user), session.id);
  return toPublic(user);
}

export async function signOut(): Promise<void> {
  const client = readClientSession();
  if (client) await idbDelete("sessions", client.sessionId);
  clearClientSession();
}

export async function requireUser(): Promise<PublicUser> {
  const user = await currentUser();
  if (user) return user;
  const file = location.pathname.split("/").pop() || "account.html";
  const next = encodeURIComponent(`${file}${location.search}`);
  location.assign(`sign-in.html?next=${next}`);
  return new Promise(() => undefined) as Promise<PublicUser>;
}

export function signInHref(next?: string): string {
  const target = next ?? `${location.pathname.split("/").pop() || ""}${location.search}`;
  return `sign-in.html?next=${encodeURIComponent(target)}`;
}
