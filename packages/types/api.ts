import { z } from "zod";

import { DeviceTypeSchema } from "./device";
import { nonEmptyStringSchema } from "./helper";

export const GetDevicesSchema = z.object({
	type: DeviceTypeSchema.nullish().describe("filter by device type"),
	building: nonEmptyStringSchema.nullish().describe("filter by building"),
});
