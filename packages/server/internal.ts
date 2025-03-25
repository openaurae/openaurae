import { type NetworkInterfaceInfo, networkInterfaces } from "node:os";
import { clerkMiddleware } from "@hono/clerk-auth";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

import { isNotNil } from "@openaurae/lib";
import { type AuthVariables, userInfo } from "./middleware";

const internalApi = new Hono<{ Variables: AuthVariables }>();

internalApi.use("*", clerkMiddleware(), userInfo);

// Currently the server is in the professor's office and doesn't have a static IP,
// it's more convenient for debugging and maintenance if we can get the IP from API.
internalApi.get("/ips", async (c) => {
	const { readAll } = c.var.permissions;

	if (!readAll) {
		throw new HTTPException(400, { message: "Admin role required." });
	}

	const nets = Object.entries(networkInterfaces())
		.flatMap(([name, nets]) => handleNetInfo(name, nets))
		.filter(isNotNil);

	return c.json(nets);
});

function handleNetInfo(
	name: string,
	nets?: NetworkInterfaceInfo[],
): string[] | null {
	if (name.startsWith("docker") || !nets) {
		return null;
	}

	return nets
		.filter(({ family, internal }) => family === "IPv4" && !internal)
		.map((net) => net.address);
}

export { internalApi };
