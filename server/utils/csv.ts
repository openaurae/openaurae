import { addHours, isBefore } from "date-fns";
import { type NewSignedKey, type SignedKey, db } from "~~/server/database";

export async function verifyKeyId(
  keyId: string,
): Promise<SignedKey | undefined> {
  const key = await getUserKey({ key_id: keyId });

  return isValidKey(key) ? key : undefined;
}

export async function signUserKey(userId: string): Promise<SignedKey> {
  const key = await getUserKey({ user_id: userId });

  if (key && isValidKey(key)) {
    return key;
  }

  const now = new Date();

  return await upsertUserKey({
    user_id: userId,
    created_at: now,
    expires_at: addHours(now, 8),
  });
}

function isValidKey(key?: SignedKey | null): boolean {
  if (key === null || key === undefined) {
    return false;
  }

  return isBefore(Date.now(), key.expires_at);
}

async function getUserKey(
  filter: Pick<SignedKey, "key_id"> | Pick<SignedKey, "user_id">,
): Promise<SignedKey | undefined> {
  const qb = db.selectFrom("signed_keys").selectAll();

  if ("key_id" in filter) {
    qb.where("key_id", "=", filter.key_id);
  } else if ("user_id" in filter) {
    qb.where("user_id", "=", filter.user_id);
  } else {
    throw new Error("Must get user signed key by user_id or key_id");
  }

  return await qb.executeTakeFirst();
}

async function upsertUserKey(key: NewSignedKey): Promise<SignedKey> {
  return await db
    .insertInto("signed_keys")
    .values(key)
    .onConflict((oc) => oc.column("user_id").doUpdateSet(key))
    .returningAll()
    .executeTakeFirstOrThrow();
}
