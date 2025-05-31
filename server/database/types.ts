import type { Device, Sensor, SensorReading, SensorType } from "#shared/types";
import type { Generated, Insertable, Selectable } from "kysely";

export type Database = {
  devices: DeviceTable;
  sensors: SensorTable;
  nemo_measure_sets: NemoMeasureSetTable;
  signed_keys: SignedKeyTable;
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
type SignedKeyTable = {
  user_id: string;
  key_id: Generated<string>;
  created_at: Date;
  expires_at: Date;
};

export type ReadingTables = {
  [T in SensorType as `readings_${T}`]: SensorReading<T>;
};

export type ReadingTable = keyof ReadingTables;
export type NemoMeasureSet = Selectable<NemoMeasureSetTable>;
export type SignedKey = Selectable<SignedKeyTable>;
export type NewSignedKey = Insertable<SignedKeyTable>;
