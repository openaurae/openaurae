import { z } from "zod";

import { extractDate, isNotNil } from "@openaurae/lib";
import { type Reading, ReadingSchema, type SensorType } from "@openaurae/types";

const MessageSchema = ReadingSchema.omit({
	device: true,
	sensor_id: true,
	reading_type: true,
	processed: true,
	date: true,
	time: true,
}).extend({
	device: z.string().optional(),
	device_id: z.string().optional(),
	sensor: z.string().optional(),
	sensor_id: z.string().optional(),
	tmp: z.number().optional(),
	rh: z.number().optional(),
	time: z.coerce.date().optional(),
});

type Message = z.infer<typeof MessageSchema>;

/**
 * Parse a MQTT message to a {@link Reading} record.
 *
 * 1. transform payload field names to lowercase, e.g. `RH -> rh`.
 * 2. if from Zigbee devices, parse device and sensor id from message topic.
 * 3. handle alias, e.g. `tmp -> temperature`.
 * 4. parse sensor type
 * 5. set missing fields (`processed`, `date`, `time` if is `null`)
 */
export function parseMessage(topic: string, payload: object): Reading {
	const message = MessageSchema.parse({
		...lowercaseFieldNames(payload),
		...parseTopic(topic),
	});

	// handle alias
	message.temperature = message.temperature ?? message.tmp;
	message.humidity = message.humidity ?? message.rh;
	message.sensor_id = message.sensor_id ?? message.sensor;
	message.device = message.device_id ?? message.device;

	const time = message.time ?? new Date();

	return ReadingSchema.parse({
		...message,
		time,
		reading_type: parseSensorType(message),
		date: extractDate(time),
		processed: false,
	});
}

function lowercaseFieldNames(payload: object): object {
	const entries = Object.entries(payload).map(([name, value]) => [
		name.toLowerCase(),
		value,
	]);
	return Object.fromEntries(entries);
}

/**
 * Device id and sensor id of Zigbee devices are included
 * only in the message topic.
 * AQ boxes include ids in the message payload.
 */
function parseTopic(
	topic: string,
): Pick<Reading, "device" | "sensor_id"> | null {
	const matched = topic.match(/^zigbee\/(.+?)\/(.+?)(\/.*)?$/);

	if (!matched) {
		return null;
	}

	const [_, deviceId, sensorId] = matched;

	return {
		device: deviceId,
		sensor_id: sensorId,
	};
}

function parseSensorType({
	sensor_id,
	power,
	temperature,
	contact,
	occupancy,
	angle_x,
}: Message): SensorType {
	if (sensor_id === "ptqs1005") {
		return "ptqs1005";
	}
	if (sensor_id === "pms5003st") {
		return "pms5003st";
	}
	if (isNotNil(power)) {
		return "zigbee_power";
	}
	if (isNotNil(temperature)) {
		return "zigbee_temp";
	}
	if (isNotNil(contact)) {
		return "zigbee_contact";
	}
	if (isNotNil(occupancy)) {
		return "zigbee_occupancy";
	}
	if (isNotNil(angle_x)) {
		return "zigbee_vibration";
	}
	throw new Error("can not determine sensor type");
}
