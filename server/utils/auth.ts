import type { H3Event } from "h3";

export function getUserId(event: H3Event): string | null {
  const { userId } = event.context.auth();

  return userId;
}

export function requireLogin(event: H3Event): string {
  const userId = getUserId(event);

  if (!userId) {
    throw createError({
      statusCode: 401,
      message: "Login required",
    });
  }

  return userId;
}

export function hasPermission(
  event: H3Event,
  permission: "org:all:read" | "org:all:update",
): boolean {
  const { has, userId } = event.context.auth();

  return userId !== null && has({ permission });
}
