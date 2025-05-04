import { $DeviceType, type Device, type DeviceType } from "#shared/types";
import { z } from "zod";
import { fromError } from "zod-validation-error";
import { db } from "~/server/database";

const $Query = z.object({
  type: $DeviceType.optional(),
});

export default defineEventHandler(async (event) => {
  const {
    success,
    data: query,
    error,
  } = await getValidatedQuery(event, $Query.safeParseAsync);

  if (!success && error) {
    throw createError({
      status: 400,
      message: fromError(error).toString(),
    });
  }

  const { type } = query;
  const { has, userId } = event.context.auth();

  if (!userId) {
    return await getPublicDevices(type);
  }

  if (has({ permission: "org:all:read" })) {
    return await getDevices(type);
  }

  return await getUserDevices(userId, type);
});

async function getPublicDevices(type?: DeviceType): Promise<Device[]> {
  let query = db
    .selectFrom("devices")
    .selectAll()
    .where("is_public", "is", true);

  if (type) {
    query = query.where("type", "=", type);
  }

  console.log(query);

  return await query.execute();
}

async function getUserDevices(
  userId: string,
  type?: DeviceType,
): Promise<Device[]> {
  let query = db
    .selectFrom("devices")
    .selectAll()
    .where((eb) =>
      eb.or([eb("is_public", "is", true), eb("user_id", "=", userId)]),
    );

  if (type) {
    query = query.where("type", "=", type);
  }

  return await query.execute();
}

async function getDevices(type?: DeviceType): Promise<Device[]> {
  let query = db.selectFrom("devices").selectAll();

  if (type) {
    query = query.where("type", "=", type);
  }

  return await query.execute();
}
