import type { Device } from "#shared/types";

/**
 * Room names are manually recorded in format `<building>_<room><_Env>?`
 * such as `69_G.56_Corridor_Env` or `Staging Lab_Corner B`.
 * The default room name is `Pièce par défaut` if it is not manually updated.
 */
export function parseLocation(
  name: string | null | undefined,
): Pick<Device, "room" | "building"> {
  const result = name?.match(/^([^_]+?)_(.+?)(_Env)?$/);
  const [_, building, room] = result ?? [null, null, null];

  return {
    building,
    room: room?.replaceAll("_", " ") ?? null,
  };
}
