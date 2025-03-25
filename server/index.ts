import {api} from "@openaurae/api";
import {mqttClient} from "@openaurae/mqtt";

mqttClient.subscribe({zigbee: true, airQuality: true});

export default api;
