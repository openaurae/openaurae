import type { Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  devices: DeviceTable;
  sensors: SensorTable;
  readings_nemo_cloud: NemoCloudReadingTable;
  nemo_measure_sets: NemoMeasureSetTable;
}

export interface DeviceTable {
  id: string;
  name: string | null;
  type: "air_quality" | "zigbee" | "nemo_cloud";
  latitude: number | null;
  longitude: number | null;
  building: string | null;
  room: string | null;
  is_public: boolean;
}

export interface SensorTable {
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
}

export interface NemoCloudReadingTable {
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
}

export interface NemoMeasureSetTable {
  bid: number;
  device_serial: string;
  start: Date;
  end: Date;
  values_number: number;
}

export type Device = Selectable<DeviceTable>;
export type Sensor = Selectable<SensorTable>;
export type NemoCloudReading = Selectable<NemoCloudReadingTable>;
export type NemoMeasureSet = Selectable<NemoMeasureSetTable>;
export type NewNemoCloudReading = Insertable<NemoCloudReadingTable>;
export type NewNemoMeasureSet = Insertable<NemoMeasureSetTable>;
export type UpdateNemoMeasureSet = Updateable<NemoMeasureSetTable>;
