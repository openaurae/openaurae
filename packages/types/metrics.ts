import type { MetricName } from "./reading";
import type { SensorType } from "./sensor";

export type MetricMetadata = {
	displayName: string;
	unit?: string;
	type: "number" | "string" | "boolean";
};

/**
 * Since Scylla/Cassandra is a
 * [wide-column database](https://www.scylladb.com/glossary/wide-column-database/),
 * a reading record contains all metric columns but unrelated metric column values
 * are always `null`. We need to record associated metrics for all sensor types
 * in order to validate requests for a specific metric data of the target device.
 */
export const sensorMetricNames: Record<SensorType, MetricName[]> = {
	zigbee_contact: ["contact", "voltage", "battery"],
	zigbee_temp: ["humidity", "temperature", "voltage", "battery"],
	zigbee_power: [
		"consumption",
		"power",
		"state",
		"temperature",
		"voltage",
		"battery",
	],
	zigbee_occupancy: ["illuminance", "occupancy", "voltage", "battery"],
	zigbee_vibration: [
		"action",
		"angle",
		"angle_x",
		"angle_x_absolute",
		"angle_y",
		"angle_y_absolute",
		"angle_z",
		"battery",
		"voltage",
	],
	ptqs1005: ["ch2o", "co2", "humidity", "pm25", "temperature", "tvoc"],
	pms5003st: [
		"cf_pm1",
		"cf_pm10",
		"cf_pm25",
		"ch2o",
		"humidity",
		"pd05",
		"pd10",
		"pd100",
		"pd100g",
		"pd25",
		"pd50",
		"pm1",
		"pm10",
		"pm25",
		"pmv10",
		"pmv100",
		"pmv25",
		"pmv_total",
		"pmvtotal",
		"temperature",
	],
	nemo_cloud: [
		"battery",
		"ch2o",
		"co2",
		"humidity",
		"lvocs",
		"pm1",
		"pm10",
		"pm25",
		"pm4",
		"pressure",
		"temperature",
	],
};

/**
 * Metadata of all metrics.
 */
export const metricsMetadata: Record<MetricName, MetricMetadata> = {
	action: {
		displayName: "Action",
		type: "string",
	},
	angle: {
		displayName: "Angle",
		type: "number",
		unit: "°",
	},
	angle_x: {
		displayName: "Angle X",
		type: "number",
		unit: "°",
	},
	angle_x_absolute: {
		displayName: "Absolute Angle X",
		type: "number",
		unit: "°",
	},
	angle_y: {
		displayName: "Angle Y",
		type: "number",
		unit: "°",
	},
	angle_y_absolute: {
		displayName: "Absolute Angle Y",
		type: "number",
		unit: "°",
	},
	angle_z: {
		displayName: "Angle Z",
		type: "number",
		unit: "°",
	},
	battery: {
		displayName: "Battery",
		type: "number",
		unit: "V",
	},
	cf_pm1: {
		displayName: "CF PM 1",
		type: "number",
	},
	cf_pm10: {
		displayName: "CF PM 10",
		type: "number",
	},
	cf_pm25: {
		displayName: "CF PM 25",
		type: "number",
	},
	ch2o: {
		displayName: "CH2O",
		type: "number",
		unit: "mg/m3",
	},
	co2: {
		displayName: "CO2",
		type: "number",
		unit: "ppm",
	},
	consumption: {
		displayName: "Consumption",
		type: "number",
	},
	contact: {
		displayName: "Contact",
		type: "boolean",
	},
	humidity: {
		displayName: "Humidity",
		type: "number",
		unit: "Rh%",
	},
	illuminance: {
		displayName: "Illuminance",
		type: "number",
	},
	lvocs: {
		displayName: "LVOC",
		type: "number",
		unit: "ppb",
	},
	occupancy: {
		displayName: "Occupancy",
		type: "boolean",
	},
	pd05: {
		displayName: "PD 5",
		type: "number",
	},
	pd10: {
		displayName: "PD 10",
		type: "number",
	},
	pd25: {
		displayName: "PD 25",
		type: "number",
	},
	pd50: {
		displayName: "PD 5",
		type: "number",
	},
	pd100: {
		displayName: "PD 100",
		type: "number",
	},
	pd100g: {
		displayName: "PD 100g",
		type: "number",
	},
	pm1: {
		displayName: "PM 1",
		type: "number",
		unit: "µg/m3",
	},
	pm10: {
		displayName: "PM 10",
		type: "number",
		unit: "µg/m3",
	},
	pm25: {
		displayName: "PM 2.5",
		type: "number",
		unit: "µg/m3",
	},
	pm4: {
		displayName: "PM 4",
		type: "number",
		unit: "µg/m3",
	},
	pmv10: {
		displayName: "PMV 10",
		type: "number",
		unit: "µg/m3",
	},
	pmv25: {
		displayName: "PMV 2.5",
		type: "number",
		unit: "µg/m3",
	},
	pmv100: {
		displayName: "PMV 100",
		type: "number",
		unit: "µg/m3",
	},
	pmv_total: {
		displayName: "PMV Total",
		type: "number",
		unit: "µg/m3",
	},
	pmvtotal: {
		displayName: "PMV Total",
		type: "number",
		unit: "µg/m3",
	},
	power: {
		displayName: "Power",
		type: "number",
		unit: "W",
	},
	pressure: {
		displayName: "Pressure",
		type: "number",
		unit: "mb",
	},
	state: {
		displayName: "State",
		type: "string",
	},
	temperature: {
		displayName: "Temperature",
		type: "number",
		unit: "°C",
	},
	tvoc: {
		displayName: "TVOC",
		type: "number",
		unit: "ppm",
	},
	voltage: {
		displayName: "Voltage",
		type: "number",
		unit: "V",
	},
};
