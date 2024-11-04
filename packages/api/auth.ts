import { getAuth } from "@hono/clerk-auth";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import { Permission } from "@openaurae/types";
import type { AuthVariables } from "./context";

export const setUerInfo = createMiddleware<{ Variables: AuthVariables }>(
	async (c, next) => {
		const auth = getAuth(c);

		if (!auth || !auth.userId) {
			throw new HTTPException(401, { message: "Login required." });
		}

		c.set("userId", auth.userId);
		c.set("permissions", {
			readAll: auth.has({ permission: Permission.ReadAll }),
			updateAll: auth.has({ permission: Permission.UpdateAll }),
		});

		await next();
	},
);
