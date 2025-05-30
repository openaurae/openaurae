CREATE TABLE IF NOT EXISTS nemo_measure_sets
(
    bid           bigint,
    device_serial varchar(64),
    start         timestamptz NOT NULL,
    "end"         timestamptz NOT NULL,
    values_number int8,
    PRIMARY KEY (device_serial, bid)
);
