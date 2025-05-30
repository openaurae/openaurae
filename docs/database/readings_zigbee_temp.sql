CREATE TABLE IF NOT EXISTS readings_zigbee_temp
(
    device_id   varchar(32) NOT NULL,
    sensor_id   varchar(32) NOT NULL,
    time        timestamptz NOT NULL,
    temperature float8      NOT NULL,
    humidity    float8      NOT NULL,
    battery     float8      NOT NULL,
    voltage     float8      NOT NULL,
    PRIMARY KEY (device_id, sensor_id, time),
    FOREIGN KEY (device_id, sensor_id) REFERENCES sensors (device_id, id)
);

SELECT *
FROM create_hypertable('readings_zigbee_temp', by_range('time'));
SELECT *
FROM add_dimension('readings_zigbee_temp', by_hash('device_id', 16));

alter table readings_zigbee_temp set
    (
    timescaledb.enable_columnstore = true,
    timescaledb.orderby = 'time DESC, sensor_id DESC',
    timescaledb.segmentby = 'device_id'
    );

SELECT add_compression_policy('readings_zigbee_temp', INTERVAL '7 days');
