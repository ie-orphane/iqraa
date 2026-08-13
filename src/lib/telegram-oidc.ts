import env from "@/env";
import { fetchWithTimeout } from "@/lib/crypto";

export type TelegramIdToken = {
  sub: string;
  id: number;
  name: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  picture?: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
};

function decodeJwtPayload(token: string): TelegramIdToken {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  const payload = parts[1];
  const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  return JSON.parse(
    Buffer.from(padded, "base64url").toString("utf-8"),
  ) as TelegramIdToken;
}

type JwksKey = {
  kid: string;
  kty: string;
  alg: string;
  n?: string;
  e?: string;
  x?: string;
  y?: string;
  crv?: string;
};

export async function verifyTelegramIdToken(
  idToken: string,
): Promise<TelegramIdToken> {
  const jwksResponse = await fetchWithTimeout(
    "https://oauth.telegram.org/.well-known/jwks.json",
  );
  if (!jwksResponse.ok) throw new Error("Failed to fetch Telegram JWKS");

  const jwks = (await jwksResponse.json()) as { keys: JwksKey[] };

  const headerB64 = idToken.split(".")[0];
  const padded = headerB64 + "=".repeat((4 - (headerB64.length % 4)) % 4);
  const header = JSON.parse(
    Buffer.from(padded, "base64url").toString("utf-8"),
  ) as { kid?: string; alg: string };

  const jwk = header.kid
    ? jwks.keys.find((key) => key.kid === header.kid)
    : jwks.keys[0];

  if (!jwk) throw new Error("No matching JWK found for token kid");

  const keyData = {
    kty: jwk.kty,
    ...(jwk.n && { n: jwk.n }),
    ...(jwk.e && { e: jwk.e }),
    ...(jwk.x && { x: jwk.x }),
    ...(jwk.y && { y: jwk.y }),
    ...(jwk.crv && { crv: jwk.crv }),
    alg: jwk.alg,
    ext: true,
  };

  let algorithm: RsaHashedImportParams | EcKeyImportParams;
  if (header.alg === "RS256") {
    algorithm = { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
  } else if (header.alg === "ES256") {
    algorithm = { name: "ECDSA", namedCurve: "P-256" };
  } else {
    throw new Error(`Unsupported algorithm: ${header.alg}`);
  }

  const cryptoKey = await crypto.subtle.importKey(
    "jwk",
    keyData,
    algorithm,
    false,
    ["verify"],
  );

  const [headerPayload, signatureB64] = [
    idToken.split(".").slice(0, 2).join("."),
    idToken.split(".")[2],
  ];

  const signaturePadded =
    signatureB64 + "=".repeat((4 - (signatureB64.length % 4)) % 4);
  const signature = Buffer.from(signaturePadded, "base64url");
  const data = new TextEncoder().encode(headerPayload);

  const valid = await crypto.subtle.verify(
    algorithm.name === "ECDSA"
      ? { name: "ECDSA", hash: "SHA-256" }
      : algorithm,
    cryptoKey,
    signature,
    data,
  );
  if (!valid) throw new Error("Invalid id_token signature");

  const payload = decodeJwtPayload(idToken);

  if (payload.iss !== "https://oauth.telegram.org") {
    throw new Error("Invalid issuer");
  }
  if (String(payload.aud) !== env.TELEGRAM_CLIENT_ID) {
    throw new Error("Invalid audience");
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
}
