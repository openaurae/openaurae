import { describe, expect, it } from "bun:test";
import { differenceInDays, differenceInMinutes } from "date-fns";

import { parseMessage } from "./message";

describe("test parsing MQTT message", () => {
	it("should parse Zigbee contact message", () => {
		const now = new Date();

		const reading = parseMessage("zigbee/device/sensor", {
			battery: 22.3,
			voltage: 10.2,
			contact: true,
		});

		expect(differenceInDays(reading.date, now)).toBe(0);
		expect(differenceInMinutes(reading.time, now)).toBe(0);

		expect({
			...reading,
			date: undefined,
			time: undefined,
		} as object).toEqual({
			device: "device",
			reading_type: "zigbee_contact",
			processed: false,
			sensor_id: "sensor",
			battery: 22.3,
			voltage: 10.2,
			contact: true,
		});
	});

	it("should parse Zigbee temperature message", () => {
		const now = new Date();

		const reading = parseMessage("zigbee/device/sensor", {
			voltage: 10.2,
			tmp: 36.1,
			rh: 10.1,
		});

		expect(differenceInDays(reading.date, now)).toBe(0);
		expect(differenceInMinutes(reading.time, now)).toBe(0);

		expect({
			...reading,
			date: undefined,
			time: undefined,
		} as object).toEqual({
			device: "device",
			reading_type: "zigbee_temp",
			processed: false,
			sensor_id: "sensor",
			voltage: 10.2,
			humidity: 10.1,
			temperature: 36.1,
		});
	});

	it("should parse Zigbee occupancy message", () => {
		const now = new Date();

		const reading = parseMessage("zigbee/device/sensor", {
			illuminance: 138,
			linkquality: 78,
			occupancy: true,
			battery: 100,
			voltage: 3065,
			illuminance_lux: 138,
		});

		expect(differenceInDays(reading.date, now)).toBe(0);
		expect(differenceInMinutes(reading.time, now)).toBe(0);

		expect({
			...reading,
			date: undefined,
			time: undefined,
		} as object).toEqual({
			device: "device",
			reading_type: "zigbee_occupancy",
			processed: false,
			sensor_id: "sensor",
			illuminance: 138,
			occupancy: true,
			battery: 100,
			voltage: 3065,
		});
	});

	it("should parse pms50003st message", () => {
		const reading = parseMessage("air-quality/pms", {
			CF_PM1: 0,
			CF_PM25: 0,
			CF_PM10: 0,
			PM1: 0,
			PM25: 0,
			PM10: 0,
			PD05: 267,
			PD10: 72,
			PD25: 10,
			PD50: 0,
			PD100: 0,
			PD100g: 0,
			CH2O: 0,
			TMP: 27.1,
			RH: 20,
			PMV10: 185591.82419137922,
			PMV25: 338702.9446709766,
			PMV100: 338702.9446709766,
			PMVtotal: 338702.9446709766,
			sensor: "pms5003st",
			time: "2024-08-28T04:50:30",
			latitude: null,
			longitude: null,
			ip_address: "192.168.137.34",
			device_id: "b8:27:eb:be:88:fd",
		});

		expect(reading).toEqual({
			device: "b8:27:eb:be:88:fd",
			date: new Date("2024-08-28"),
			reading_type: "pms5003st",
			processed: false,
			sensor_id: "pms5003st",
			time: new Date("2024-08-28T04:50:30"),
			cf_pm1: 0,
			cf_pm25: 0,
			cf_pm10: 0,
			pm1: 0,
			pm25: 0,
			pm10: 0,
			pd05: 267,
			pd10: 72,
			pd25: 10,
			pd50: 0,
			pd100: 0,
			pd100g: 0,
			ch2o: 0,
			temperature: 27.1,
			humidity: 20,
			pmv10: 185591.82419137922,
			pmv25: 338702.9446709766,
			pmv100: 338702.9446709766,
			pmvtotal: 338702.9446709766,
			ip_address: "192.168.137.34",
			latitude: null,
			longitude: null,
		});
	});
});
