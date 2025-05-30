CREATE TABLE IF NOT EXISTS readings_nemo_cloud
(
    device_id varchar(32) NOT NULL,
    sensor_id varchar(32) NOT NULL,
    time      timestamptz NOT NULL,
    battery   float8,
    ch2o      float8,
    tmp       float8,
    rh        float8,
    pressure  float8,
    co2       float8,
    lvoc      float8,
    pm1       float8,
    pm10      float8,
    pm2_5     float8,
    pm4       float8,
    PRIMARY KEY (device_id, sensor_id, time),
    FOREIGN KEY (device_id, sensor_id) REFERENCES sensors (device_id, id)
);

SELECT *
FROM create_hypertable('readings_nemo_cloud', by_range('time'));
SELECT *
FROM add_dimension('readings_nemo_cloud', by_hash('device_id', 16));

alter table readings_nemo_cloud set
    (
    timescaledb.enable_columnstore = true,
    timescaledb.orderby = 'time DESC, sensor_id DESC',
    timescaledb.segmentby = 'device_id'
    );

SELECT add_compression_policy('readings_nemo_cloud', INTERVAL '7 days');

SELECT
    pg_size_pretty(before_compression_total_bytes) as before,
    pg_size_pretty(after_compression_total_bytes) as after
FROM hypertable_compression_stats('readings_nemo_cloud');
