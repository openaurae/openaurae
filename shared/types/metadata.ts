import type {
  SensorMetricName,
  SensorReading,
  SensorType,
} from "#shared/types";

export type SensorMetricMetadata<
  T extends SensorType,
  K extends SensorMetricName<T> = SensorMetricName<T>,
> = {
  name: K;
  type: TypeToString<SensorReading<T>[K]>;
  displayName: string;
  unit?: string;
};

type TypeToString<T> = T extends string
  ? "string"
  : T extends number
    ? "number"
    : T extends boolean
      ? "boolean"
      : "unknown";
