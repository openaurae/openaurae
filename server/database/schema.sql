CREATE TYPE device_type AS ENUM ('air_quality', 'zigbee', 'nemo_cloud');
CREATE TYPE sensor_type AS ENUM ('ptqs1005', 'pms5003st', 'zigbee_temp', 'zigbee_occupancy', 'zigbee_contact', 'zigbee_vibration', 'zigbee_power', 'nemo_cloud');

CREATE TABLE IF NOT EXISTS devices
(
    id        varchar(32) NOT NULL PRIMARY KEY,
    name      varchar(32),
    type      device_type NOT NULL,
    user_id   varchar(64),
    latitude  float8,
    longitude float8,
    building  varchar(32),
    room      varchar(32),
    is_public bool        NOT NULL default false
);

CREATE TABLE IF NOT EXISTS sensors
(
    device_id varchar(32) NOT NULL references devices (id),
    id        varchar(32) NOT NULL,
    name      varchar(32),
    type      sensor_type NOT NULL,

    PRIMARY KEY (device_id, id)
);


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

CREATE TABLE IF NOT EXISTS nemo_measure_sets
(
    bid           bigint,
    device_serial varchar(64),
    start         timestamptz NOT NULL,
    "end"         timestamptz NOT NULL,
    values_number int8,
    PRIMARY KEY (device_serial, bid)
);

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


CREATE TABLE IF NOT EXISTS readings_zigbee_contact
(
    device_id varchar(32) NOT NULL,
    sensor_id varchar(32) NOT NULL,
    time      timestamptz NOT NULL,
    contact   bool        NOT NULL,
    battery   float8      NOT NULL,
    voltage   float8      NOT NULL,
    PRIMARY KEY (device_id, sensor_id, time),
    FOREIGN KEY (device_id, sensor_id) REFERENCES sensors (device_id, id)
);

SELECT *
FROM create_hypertable('readings_zigbee_contact', by_range('time'));
SELECT *
FROM add_dimension('readings_zigbee_contact', by_hash('device_id', 16));


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
