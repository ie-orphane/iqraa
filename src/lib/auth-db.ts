import type { AuthProvider } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateSessionToken, hashToken } from "@/lib/crypto";

const SESSION_DAYS = 7;

export type ConnectionInput = {
  provider: AuthProvider;
  providerId: string;
  name: string;
  username: string;
  avatar?: string | null;
};

export async function upsertConnectionAndUser(input: ConnectionInput) {
  const existing = await prisma.connection.findUnique({
    where: {
      provider_providerId: {
        provider: input.provider,
        providerId: input.providerId,
      },
    },
    include: { user: true },
  });

  if (existing) {
    const [connection] = await prisma.$transaction([
      prisma.connection.update({
        where: { id: existing.id },
        data: {
          name: input.name,
          username: input.username,
          avatar: input.avatar ?? null,
          accessedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: existing.userId },
        data: {
          name: input.name,
          username: input.username,
          image: input.avatar ?? null,
        },
      }),
    ]);

    return { connectionId: connection.id, userId: existing.userId };
  }

  const user = await prisma.user.create({
    data: {
      name: input.name,
      username: input.username,
      image: input.avatar ?? null,
      connections: {
        create: {
          provider: input.provider,
          providerId: input.providerId,
          name: input.name,
          username: input.username,
          avatar: input.avatar ?? null,
        },
      },
    },
    include: { connections: true },
  });

  const connection = user.connections[0];
  if (!connection) {
    throw new Error("Failed to create connection");
  }

  return { connectionId: connection.id, userId: user.id };
}

export async function createAuthSession(params: {
  connectionId: string;
  userId: string;
}) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash,
      userId: params.userId,
      connectionId: params.connectionId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function deleteSessionByToken(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function getUserFromSessionToken(token: string) {
  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: {
      user: true,
      connection: true,
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    username: session.user.username,
    image: session.user.image,
    connectionId: session.connectionId,
    provider: session.connection.provider,
  };
}
