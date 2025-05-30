CREATE TABLE IF NOT EXISTS readings_zigbee_power
(
    device_id   varchar(32) NOT NULL,
    sensor_id   varchar(32) NOT NULL,
    time        timestamptz NOT NULL,
    state       varchar(32),
    power       float8      NOT NULL,
    battery     float8      NOT NULL,
    voltage     float8      NOT NULL,
    consumption float8      NOT NULL,
    PRIMARY KEY (device_id, sensor_id, time),
    FOREIGN KEY (device_id, sensor_id) REFERENCES sensors (device_id, id)
);

SELECT *
FROM create_hypertable('readings_zigbee_power', by_range('time'));
SELECT *
FROM add_dimension('readings_zigbee_power', by_hash('device_id', 16));

alter table readings_zigbee_power set
    (
    timescaledb.enable_columnstore = true,
    timescaledb.orderby = 'time DESC, sensor_id DESC',
    timescaledb.segmentby = 'device_id'
    );

SELECT add_compression_policy('readings_zigbee_power', INTERVAL '7 days');
