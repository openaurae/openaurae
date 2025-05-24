import { MetricsMetadata } from "#shared/metadata";
import type { MetricMetadata, SensorReading, SensorType } from "#shared/types";

type MetricWithMetadata<T extends SensorType> = MetricMetadata<T> & {
  value: unknown;
};

export function metricsWithMetadata<T extends SensorType>(
  sensorType: T,
  reading: SensorReading<T>,
): MetricWithMetadata<T>[] {
  return MetricsMetadata[sensorType].map((metadata) => ({
    ...metadata,
    value: reading[metadata.name],
  }));
}
