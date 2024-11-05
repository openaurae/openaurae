import { startOfDay, subWeeks } from "date-fns";

import { api } from "@openaurae/api";
import {
	migrateAwsOpenAurae,
	migrateNemoCloud,
	migrateS5NemoCloud,
	periodicallyMigrate,
} from "@openaurae/migration";
import { MqttClient } from "@openaurae/mqtt";

function oneWeekAgo(): Date {
	return startOfDay(subWeeks(new Date(), 1));
}

periodicallyMigrate(migrateAwsOpenAurae, {
	getStartDate: oneWeekAgo,
	taskNum: 5,
	intervalInHours: 2,
});

periodicallyMigrate(migrateNemoCloud, {
	getStartDate: oneWeekAgo,
	taskNum: 10,
	intervalInHours: 2,
});

periodicallyMigrate(migrateS5NemoCloud, {
	getStartDate: oneWeekAgo,
	taskNum: 10,
	intervalInHours: 2,
});

const mqttClient = await MqttClient.fromEnv();
mqttClient.subscribe({ zigbee: true, airQuality: true });

export default api;
