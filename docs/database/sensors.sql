CREATE TYPE sensor_type AS ENUM ('ptqs1005', 'pms5003st', 'zigbee_temp', 'zigbee_occupancy', 'zigbee_contact', 'zigbee_vibration', 'zigbee_power', 'nemo_cloud');

CREATE TABLE IF NOT EXISTS sensors
(
    device_id varchar(32) NOT NULL references devices (id),
    id        varchar(32) NOT NULL,
    name      varchar(32) NOT NULL,
    type      sensor_type NOT NULL,

    PRIMARY KEY (device_id, id)
);
