import { startOfDay, subWeeks } from "date-fns";

import { api } from "@openaurae/api";
import {
	migrateNemoCloud,
	migrateS5NemoCloud,
	periodicallyMigrate,
} from "@openaurae/migration";
import { mqttClient } from "@openaurae/mqtt";

function oneWeekAgo(): Date {
	return startOfDay(subWeeks(new Date(), 1));
}

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

mqttClient.subscribe({ zigbee: true, airQuality: true });

export default api;
