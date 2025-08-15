import { db } from "../database";
import { mqttClient } from "../mqtt";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("close", async () => {
    await db.destroy();
    mqttClient.end();
  });
});
