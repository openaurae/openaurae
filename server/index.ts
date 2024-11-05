import { subDays } from "date-fns";

import { api } from "@openaurae/api";
import { migrateAwsOpenAurae } from "@openaurae/migration";
import { MqttClient } from "@openaurae/mqtt";

/**
 * Periodically migrate data from the AWS EKS cluster.
 *
 * @see [recursive setTimeout](https://nodejs.org/en/learn/asynchronous-work/discover-javascript-timers#recursive-settimeout)
 */
function migrateAws(): void {
	migrateAwsOpenAurae({
		start: subDays(new Date(), 7),
		taskNum: 5,
	}).then(() => {
		setTimeout(migrateAws, 2 * 60 * 60 * 1000); // every 2 hours
	});
}

migrateAws();

const mqttClient = await MqttClient.fromEnv();
mqttClient.subscribe({ zigbee: true, airQuality: true });

export default api;
