import type { Selectable } from "kysely";
import type z from "zod";

import type { $Device, $DeviceType, $Reading } from "./schemas";

export type Database = {
  devices: DeviceTable;
  sensors: SensorTable;
  readings_nemo_cloud: NemoCloudReadingTable;
  nemo_measure_sets: NemoMeasureSetTable;
  readings_pms5003st: Pms5003stReadingTable;
  readings_ptqs1005: Ptqs1005ReadingTable;
  readings_zigbee_temp: ZigbeeTempReadingTable;
  readings_zigbee_contact: ZigbeeContactReadingTable;
  readings_zigbee_occupancy: ZigbeeOccupancyReadingTable;
  readings_zigbee_power: ZigbeePowerReadingTable;
  readings_zigbee_vibration: ZigbeeVibrationReadingTable;
};

export type Reading<T extends keyof typeof $Reading> = z.infer<
  (typeof $Reading)[T]
>;

type Pms5003stReadingTable = Reading<"pms5003st">;
type Ptqs1005ReadingTable = Reading<"ptqs1005">;
type ZigbeeTempReadingTable = Reading<"zigbee_temp">;
type ZigbeeOccupancyReadingTable = Reading<"zigbee_occupancy">;
type ZigbeeContactReadingTable = Reading<"zigbee_contact">;
type ZigbeePowerReadingTable = Reading<"zigbee_power">;
type ZigbeeVibrationReadingTable = Reading<"zigbee_vibration">;

type DeviceTable = z.infer<typeof $Device>;

export type SensorTable = {
  id: string;
  device_id: string;
  name: string | null;
  type:
    | "ptqs1005"
    | "pms5003st"
    | "zigbee_temp"
    | "zigbee_occupancy"
    | "zigbee_contact"
    | "zigbee_vibration"
    | "zigbee_power"
    | "nemo_cloud";
};

export type NemoCloudReadingTable = {
  device_id: string;
  sensor_id: string;
  time: Date;
  battery: number | null;
  ch2o: number | null;
  tmp: number | null;
  rh: number | null;
  pressure: number | null;
  co2: number | null;
  lvoc: number | null;
  pm1: number | null;
  pm2_5: number | null;
  pm4: number | null;
  pm10: number | null;
};

export type NemoMeasureSetTable = {
  bid: number;
  device_serial: string;
  start: Date;
  end: Date;
  values_number: number;
};

export type Device = z.infer<typeof $Device>;
export type DeviceType = z.infer<typeof $DeviceType>;
export type Sensor = Selectable<SensorTable>;
export type NemoCloudReading = Selectable<NemoCloudReadingTable>;
export type NemoMeasureSet = Selectable<NemoMeasureSetTable>;
