CREATE TABLE IF NOT EXISTS readings_ptqs1005
(
    device_id varchar(32) NOT NULL,
    sensor_id varchar(32) NOT NULL,
    time      timestamptz NOT NULL,
    tvoc      float8      NOT NULL,
    ch2o      float8      NOT NULL,
    co2       float8      NOT NULL,
    pm25      float8      NOT NULL,
    tmp       float8      NOT NULL,
    rh        float8      NOT NULL,
    latitude  float8,
    longitude float8,
    PRIMARY KEY (device_id, sensor_id, time),
    FOREIGN KEY (device_id, sensor_id) REFERENCES sensors (device_id, id)
);

SELECT *
FROM create_hypertable('readings_ptqs1005', by_range('time'));
SELECT *
FROM add_dimension('readings_ptqs1005', by_hash('device_id', 16));

alter table readings_ptqs1005 set
    (
    timescaledb.enable_columnstore = true,
    timescaledb.orderby = 'time DESC, sensor_id DESC',
    timescaledb.segmentby = 'device_id'
    );

SELECT add_compression_policy('readings_ptqs1005', INTERVAL '7 days');
