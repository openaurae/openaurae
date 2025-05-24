import type { SensorMetricName } from "./reading";
import type { SensorType } from "./sensor";

export type MetricMetadata<T extends SensorType> = {
  name: SensorMetricName<T>;
  displayName: string;
  unit?: string;
  type: "number" | "string" | "boolean";
};
