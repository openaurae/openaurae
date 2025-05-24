import { db } from "~/server/database";
import { mqttClient } from "~/server/mqtt";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("close", async () => {
    await db.destroy();
    mqttClient.end();
  });
});
