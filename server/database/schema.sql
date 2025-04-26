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
    battery   float8      NOT NULL,
    ch2o      float8,
    tmp       float8      NOT NULL,
    rh        float8      NOT NULL,
    pressure  float8      NOT NULL,
    co2       float8      NOT NULL,
    lvoc      float8      NOT NULL,
    pm1       float8      NOT NULL,
    pm10      float8      NOT NULL,
    pm2_5     float8      NOT NULL,
    pm4       float8      NOT NULL,
    PRIMARY KEY (device_id, sensor_id, time),
    FOREIGN KEY (device_id, sensor_id) REFERENCES sensors (device_id, id)
);

SELECT *
FROM create_hypertable('readings_nemo_cloud', by_range('time'));
SELECT *
FROM add_dimension('readings_nemo_cloud', by_hash('device_id', 16));
