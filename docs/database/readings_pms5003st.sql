CREATE TABLE IF NOT EXISTS readings_pms5003st
(
    device_id varchar(32) NOT NULL,
    sensor_id varchar(32) NOT NULL,
    time      timestamptz NOT NULL,
    cf_pm1    float8      NOT NULL,
    cf_pm10   float8      NOT NULL,
    cf_pm25   float8      NOT NULL,
    pd05      float8      NOT NULL,
    pd10      float8      NOT NULL,
    pd100     float8      NOT NULL,
    pd100g    float8      NOT NULL,
    pd25      float8      NOT NULL,
    pd50      float8      NOT NULL,
    pm1       float8      NOT NULL,
    pm10      float8      NOT NULL,
    pm25      float8      NOT NULL,
    pm4       float8,
    pmv10     float8      NOT NULL,
    pmv100    float8      NOT NULL,
    pmv25     float8      NOT NULL,
    pmv_total float8      NOT NULL,
    tmp       float8      NOT NULL,
    rh        float8      NOT NULL,
    ch2o      float8      NOT NULL,
    latitude  float8,
    longitude float8,
    PRIMARY KEY (device_id, sensor_id, time),
    FOREIGN KEY (device_id, sensor_id) REFERENCES sensors (device_id, id)
);

SELECT *
FROM create_hypertable('readings_pms5003st', by_range('time'));
SELECT *
FROM add_dimension('readings_pms5003st', by_hash('device_id', 16));

alter table readings_pms5003st set
    (
    timescaledb.enable_columnstore = true,
    timescaledb.orderby = 'time DESC, sensor_id DESC',
    timescaledb.segmentby = 'device_id'
    );

SELECT add_compression_policy('readings_pms5003st', INTERVAL '7 days');
