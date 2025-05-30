CREATE TABLE IF NOT EXISTS readings_zigbee_vibration
(
    device_id        varchar(32) NOT NULL,
    sensor_id        varchar(32) NOT NULL,
    time             timestamptz NOT NULL,
    angle            float8      NOT NULL,
    angle_x          float8      NOT NULL,
    angle_y          float8      NOT NULL,
    angle_z          float8      NOT NULL,
    angle_x_absolute float8      NOT NULL,
    angle_y_absolute float8      NOT NULL,
    action           varchar(32),
    battery          float8      NOT NULL,
    voltage          float8      NOT NULL,
    PRIMARY KEY (device_id, sensor_id, time),
    FOREIGN KEY (device_id, sensor_id) REFERENCES sensors (device_id, id)
);

SELECT *
FROM create_hypertable('readings_zigbee_vibration', by_range('time'));
SELECT *
FROM add_dimension('readings_zigbee_vibration', by_hash('device_id', 16));

alter table readings_zigbee_vibration set
    (
    timescaledb.enable_columnstore = true,
    timescaledb.orderby = 'time DESC, sensor_id DESC',
    timescaledb.segmentby = 'device_id'
    );

SELECT add_compression_policy('readings_zigbee_vibration', INTERVAL '7 days');
