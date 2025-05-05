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

// Currently premission creation is not supported in the free Clerk account,
// checking the admin role as workaround for now.
const Permissions = {
  readAll: "org:all:read",
  updateAll: "org:all:update",
} as const;

export function hasPermission(
  event: H3Event,
  permission: keyof typeof Permissions,
): boolean {
  const { has, userId } = event.context.auth();

  if (!userId) {
    return false;
  }

  return (
    has({ permission: Permissions[permission] }) || has({ role: "org:admin" })
  );
}
