import env from "@/env";
import { upsertConnectionAndUser } from "@/lib/auth-db";
import { establishSession } from "@/lib/auth-server";
import { fetchWithTimeout } from "@/lib/crypto";
import { verifyTelegramIdToken } from "@/lib/telegram-oidc";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_request", request.url),
    );
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get("telegram_oauth_state")?.value;
  const codeVerifier = cookieStore.get("telegram_code_verifier")?.value;

  if (!storedState || storedState !== state || !codeVerifier) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", request.url),
    );
  }

  cookieStore.delete("telegram_oauth_state");
  cookieStore.delete("telegram_code_verifier");

  try {
    const credentials = Buffer.from(
      `${env.TELEGRAM_CLIENT_ID}:${env.TELEGRAM_CLIENT_SECRET}`,
    ).toString("base64");

    const tokenResponse = await fetchWithTimeout(
      "https://oauth.telegram.org/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: env.auth.telegramCallback,
          client_id: env.TELEGRAM_CLIENT_ID,
          code_verifier: codeVerifier,
        }),
      },
    );

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error("Telegram token exchange failed:", err);
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = (await tokenResponse.json()) as { id_token?: string };
    if (!tokenData.id_token) {
      throw new Error("No id_token in Telegram response");
    }

    const telegramUser = await verifyTelegramIdToken(tokenData.id_token);
    const username =
      telegramUser.preferred_username ??
      telegramUser.name.toLowerCase().replace(/\s+/g, "_");

    const { connectionId, userId } = await upsertConnectionAndUser({
      provider: "telegram",
      providerId: String(telegramUser.sub),
      name: telegramUser.name,
      username,
      avatar: telegramUser.picture ?? null,
    });

    await establishSession({ connectionId, userId });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Telegram OIDC error:", error);
    return NextResponse.redirect(
      new URL("/login?error=authentication_failed", request.url),
    );
  }
}
