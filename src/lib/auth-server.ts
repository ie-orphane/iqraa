import { cookies } from "next/headers";
import {
  createAuthSession,
  deleteSessionByToken,
  getUserFromSessionToken,
} from "@/lib/auth-db";

export const SESSION_COOKIE = "iqraa_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function establishSession(params: {
  connectionId: string;
  userId: string;
}) {
  const { token } = await createAuthSession(params);
  await setAuthCookie(token);
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) return null;
  return getUserFromSessionToken(token);
}

export async function clearSession() {
  const token = await getAuthToken();
  if (token) {
    await deleteSessionByToken(token);
  }
  await removeAuthCookie();
}
