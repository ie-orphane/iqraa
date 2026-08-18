import { z } from "zod";

const serverSchema = z.object({
  APP_URL: z.url(),
  DATABASE_URL: z.string().min(1),
  SUPABASE_URL: z.url(),
  SUPABASE_SECRET_KEY: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  TELEGRAM_CLIENT_ID: z.string().min(1),
  TELEGRAM_CLIENT_SECRET: z.string().min(1),
});

const parsed = serverSchema.safeParse({
  APP_URL: process.env.APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
  TELEGRAM_CLIENT_ID: process.env.TELEGRAM_CLIENT_ID,
  TELEGRAM_CLIENT_SECRET: process.env.TELEGRAM_CLIENT_SECRET,
});

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

const appUrl = parsed.data.APP_URL.replace(/\/$/, "");

const env = {
  ...parsed.data,
  APP_URL: appUrl,
  auth: {
    discordCallback: `${appUrl}/api/auth/callback/discord`,
    telegramCallback: `${appUrl}/api/auth/callback/telegram`,
  },
};

export default env;
