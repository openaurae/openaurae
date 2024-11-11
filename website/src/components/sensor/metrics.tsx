import {
	type MetricName,
	type SensorType,
	metricsMetadata,
	sensorMetricNames,
} from "@openaurae/types";

export function sensorMetricGroups(
	sensorType: SensorType,
): Record<string, MetricName[]> {
	if (sensorType === "zigbee_vibration") {
		return {
			Angle: ["angle", "angle_x", "angle_y", "angle_z"],
			"Absolute Angle": ["angle_x_absolute", "angle_y_absolute"],
			Battery: ["battery"],
			Voltage: ["voltage"],
		};
	}

	if (sensorType === "pms5003st") {
		return {
			CH2O: ["ch2o"],
			Humidity: ["humidity"],
			Temperature: ["temperature"],
			"CF PM": ["cf_pm1", "cf_pm25", "cf_pm10"],
			PD: ["pd05", "pd10", "pd100", "pd100g", "pd25", "pd50"],
			PM: ["pm1", "pm10", "pm25"],
			PMV: ["pmv10", "pmv100", "pmv25", "pmv_total"],
		};
	}

	if (sensorType === "nemo_cloud") {
		return {
			Temperature: ["temperature"],
			Humidity: ["humidity"],
			CH2O: ["ch2o"],
			CO2: ["co2"],
			LVOC: ["lvocs"],
			PM: ["pm1", "pm4", "pm25", "pm10"],
			Pressure: ["pressure"],
			Battery: ["battery"],
		};
	}

	const result: Record<string, MetricName[]> = {};

	for (const name of sensorMetricNames[sensorType]) {
		const { displayName } = metricsMetadata[name];

		result[displayName] = [name];
	}

	return result;
}
