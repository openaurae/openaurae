import type { Device, Reading, Sensor } from "#shared/types";
import type { Selectable } from "kysely";

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

type DeviceTable = Device;
type SensorTable = Sensor;

type Pms5003stReadingTable = Reading<"pms5003st">;
type Ptqs1005ReadingTable = Reading<"ptqs1005">;
type ZigbeeTempReadingTable = Reading<"zigbee_temp">;
type ZigbeeOccupancyReadingTable = Reading<"zigbee_occupancy">;
type ZigbeeContactReadingTable = Reading<"zigbee_contact">;
type ZigbeePowerReadingTable = Reading<"zigbee_power">;
type ZigbeeVibrationReadingTable = Reading<"zigbee_vibration">;
type NemoCloudReadingTable = Reading<"nemo_cloud">;

type NemoMeasureSetTable = {
  bid: number;
  device_serial: string;
  start: Date;
  end: Date;
  values_number: number;
};

export type NemoMeasureSet = Selectable<NemoMeasureSetTable>;
