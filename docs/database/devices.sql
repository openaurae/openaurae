CREATE TYPE device_type AS ENUM ('air_quality', 'zigbee', 'nemo_cloud');

CREATE TABLE IF NOT EXISTS devices
(
    id        varchar(32) NOT NULL PRIMARY KEY,
    name      varchar(32) NOT NULL,
    type      device_type NOT NULL,
    user_id   varchar(64),
    latitude  float8,
    longitude float8,
    building  varchar(32),
    room      varchar(32),
    is_public bool        NOT NULL default false
);
