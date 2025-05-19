import type { SensorMetricName } from "./reading";
import type { SensorType } from "./sensor";

export type MetricMetadata = {
  displayName: string;
  unit?: string;
  type: "number" | "string" | "boolean";
};

export type SensorMetricsMetadata<T extends SensorType> = Record<
  SensorMetricName<T>,
  MetricMetadata
>;

export const MetricsMetadata: {
  [T in SensorType]: SensorMetricsMetadata<T>;
} = {
  nemo_cloud: {
    battery: {
      displayName: "Battery",
      type: "number",
      unit: "V",
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
    lvoc: {
      displayName: "LVOC",
      type: "number",
      unit: "ppb",
    },
    pm1: { displayName: "PM 1", type: "number", unit: "µg/m3" },
    pm2_5: { displayName: "PM 2.5", type: "number", unit: "µg/m3" },
    pm4: { displayName: "PM 4", type: "number", unit: "µg/m3" },
    pm10: { displayName: "PM 10", type: "number", unit: "µg/m3" },
    pressure: { displayName: "Pressure", type: "number", unit: "mb" },
    rh: { displayName: "Humidity", type: "number", unit: "Rh%" },
    tmp: { displayName: "Temperature", type: "number", unit: "°C" },
  },
  zigbee_temp: {
    battery: {
      displayName: "Battery",
      type: "number",
      unit: "V",
    },
    humidity: {
      displayName: "Humidity",
      type: "number",
      unit: "Rh%",
    },
    temperature: { displayName: "Temperature", type: "number", unit: "°C" },
    voltage: {
      displayName: "Voltage",
      type: "number",
      unit: "V",
    },
  },
  zigbee_contact: {
    battery: {
      displayName: "Battery",
      type: "number",
      unit: "V",
    },
    contact: {
      displayName: "Contact",
      type: "boolean",
    },
    voltage: {
      displayName: "Voltage",
      type: "number",
      unit: "V",
    },
  },
  zigbee_occupancy: {
    battery: {
      displayName: "Battery",
      type: "number",
      unit: "V",
    },
    voltage: {
      displayName: "Voltage",
      type: "number",
      unit: "V",
    },
    illuminance: {
      displayName: "Illuminance",
      type: "number",
    },
    occupancy: {
      displayName: "Occupancy",
      type: "boolean",
    },
  },
  zigbee_power: {
    battery: {
      displayName: "Battery",
      type: "number",
      unit: "V",
    },
    voltage: {
      displayName: "Voltage",
      type: "number",
      unit: "V",
    },
    consumption: {
      displayName: "Consumption",
      type: "number",
    },
    power: {
      displayName: "Power",
      type: "number",
      unit: "W",
    },
    state: {
      displayName: "State",
      type: "string",
    },
  },
  zigbee_vibration: {
    battery: {
      displayName: "Battery",
      type: "number",
      unit: "V",
    },
    voltage: {
      displayName: "Voltage",
      type: "number",
      unit: "V",
    },
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
  },
  pms5003st: {
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
    rh: { displayName: "Humidity", type: "number", unit: "Rh%" },
    tmp: { displayName: "Temperature", type: "number", unit: "°C" },
    latitude: {
      displayName: "Latitude",
      type: "number",
      unit: "°",
    },
    longitude: {
      displayName: "Longitude",
      type: "number",
      unit: "°",
    },
  },
  ptqs1005: {
    rh: { displayName: "Humidity", type: "number", unit: "Rh%" },
    tmp: { displayName: "Temperature", type: "number", unit: "°C" },
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
    pm25: {
      displayName: "PM 2.5",
      type: "number",
      unit: "µg/m3",
    },
    tvoc: {
      displayName: "TVOC",
      type: "number",
      unit: "ppm",
    },
    latitude: {
      displayName: "Latitude",
      type: "number",
      unit: "°",
    },
    longitude: {
      displayName: "Longitude",
      type: "number",
      unit: "°",
    },
  },
};
