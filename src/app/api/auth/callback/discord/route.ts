import env from "@/env";
import { upsertConnectionAndUser } from "@/lib/auth-db";
import { establishSession } from "@/lib/auth-server";
import { fetchWithTimeout } from "@/lib/crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar: string | null;
};

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
  const storedState = cookieStore.get("discord_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_state", request.url),
    );
  }

  cookieStore.delete("discord_oauth_state");

  try {
    const tokenResponse = await fetchWithTimeout(
      "https://discord.com/api/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: env.auth.discordCallback,
        }),
      },
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };

    const userResponse = await fetchWithTimeout(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch Discord user");
    }

    const discordUser = (await userResponse.json()) as DiscordUser;
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null;

    const { connectionId, userId } = await upsertConnectionAndUser({
      provider: "discord",
      providerId: discordUser.id,
      name: discordUser.global_name ?? discordUser.username,
      username: discordUser.username,
      avatar: avatarUrl,
    });

    await establishSession({ connectionId, userId });

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Discord OAuth error:", error);
    return NextResponse.redirect(
      new URL("/login?error=authentication_failed", request.url),
    );
  }
}
