CREATE TABLE IF NOT EXISTS readings_zigbee_occupancy
(
    device_id   varchar(32) NOT NULL,
    sensor_id   varchar(32) NOT NULL,
    time        timestamptz NOT NULL,
    occupancy   bool        NOT NULL,
    illuminance float8      NOT NULL,
    battery     float8      NOT NULL,
    voltage     float8      NOT NULL,
    PRIMARY KEY (device_id, sensor_id, time),
    FOREIGN KEY (device_id, sensor_id) REFERENCES sensors (device_id, id)
);

SELECT *
FROM create_hypertable('readings_zigbee_occupancy', by_range('time'));
SELECT *
FROM add_dimension('readings_zigbee_occupancy', by_hash('device_id', 16));

alter table readings_zigbee_occupancy set
    (
    timescaledb.enable_columnstore = true,
    timescaledb.orderby = 'time DESC, sensor_id DESC',
    timescaledb.segmentby = 'device_id'
    );

SELECT add_compression_policy('readings_zigbee_occupancy', INTERVAL '7 days');
