import type { Device, Sensor, SensorReading, SensorType } from "#shared/types";
import type { Selectable } from "kysely";

export type Database = {
  devices: DeviceTable;
  sensors: SensorTable;
  nemo_measure_sets: NemoMeasureSetTable;
} & ReadingTables;

type DeviceTable = Device;
type SensorTable = Sensor;
type NemoMeasureSetTable = {
  bid: number;
  device_serial: string;
  start: Date;
  end: Date;
  values_number: number;
};
export type ReadingTables = {
  // [T in SensorType as ReadingTable<T>]: Reading<T>;
  [T in SensorType as `readings_${T}`]: SensorReading<T>;
};

// export type ReadingTable<T extends SensorType> = `readings_${T}`;
export type ReadingTable = keyof ReadingTables;

export type NemoMeasureSet = Selectable<NemoMeasureSetTable>;
