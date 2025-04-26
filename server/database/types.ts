import type { Insertable, Selectable } from "kysely";

export interface Database {
  devices: DeviceTable;
  sensors: SensorTable;
  readings_nemo_cloud: NemoCloudReadingTable;
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
  battery: number;
  ch2o: number | null;
  tmp: number;
  rh: number;
  pressure: number;
  co2: number;
  lvoc: number;
  pm1: number;
  pm2_5: number;
  pm4: number;
  pm10: number;
}

export type Device = Selectable<DeviceTable>;
export type Sensor = Selectable<SensorTable>;
export type NemoCloudReading = Selectable<NemoCloudReadingTable>;
export type NewNemoCloudReading = Insertable<NemoCloudReadingTable>;
