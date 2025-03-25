import * as cassandra from "cassandra-driver";

export async function dropKeyspace(host: string, keyspace: string) {
	const client = new cassandra.Client({
		contactPoints: [host],
		localDataCenter: "datacenter1",
	});

	await client.execute(`DROP KEYSPACE IF EXISTS ${keyspace}`);
}

export async function createKeyspaceAndTables(host: string, keyspace: string) {
	const client = new cassandra.Client({
		contactPoints: [host],
		localDataCenter: "datacenter1",
	});

	await client.execute(`CREATE KEYSPACE IF NOT EXISTS ${keyspace}
            WITH REPLICATION = {'class' : 'SimpleStrategy','replication_factor' : 3};`);

	client.keyspace = keyspace;

	await client.execute(deviceSchema);
	await client.execute(sensorSchema);
	await client.execute(correctionSchema);
	await client.execute(readingSchema);
	await client.execute(measureSetSchema);
}

const deviceSchema = `
CREATE TABLE IF NOT EXISTS device
(
    id           text primary key,
    user_id	     text,
    name         text,
    type         text,
    last_record  timestamp,
    latitude     float,
    longitude    float,
    building     text,
    room         text
);

CREATE INDEX IF NOT EXISTS device_by_user_id
    ON device (user_id);
`;

const sensorSchema = `
CREATE TABLE IF NOT EXISTS sensor
(
    device      text,
    type        text,
    id          text,
    comments    text,
    last_record timestamp,
    name        text,
    primary key ((device), id)
);
`;

const correctionSchema = `
CREATE TABLE IF NOT EXISTS correction
(
    device       text,
    reading_type text,
    metric       text,
    expression   text,
    primary key ((device), reading_type, metric)
);
`;

const readingSchema = `
CREATE TABLE IF NOT EXISTS reading
(
    device           text,
    date             date,
    reading_type     text,
    sensor_id        text,
    processed        boolean,
    time             timestamp,
    action           text,
    angle            float,
    angle_x          float,
    angle_x_absolute float,
    angle_y          float,
    angle_y_absolute float,
    angle_z          float,
    battery          float,
    cf_pm1           float,
    cf_pm10          float,
    cf_pm25          float,
    ch2o             float,
    co2              float,
    consumption      float,
    contact          boolean,
    humidity         float,
    illuminance      float,
    ip_address       text,
    latitude         float,
    longitude        float,
    lvocs            float,
    occupancy        boolean,
    pd05             float,
    pd10             float,
    pd100            float,
    pd100g           float,
    pd25             float,
    pd50             float,
    pm1              float,
    pm10             float,
    pm25             float,
    pm4              float,
    pmv10            float,
    pmv100           float,
    pmv25            float,
    pmv_total        float,
    pmvtotal         float,
    power            float,
    pressure         float,
    state            text,
    temperature      float,
    tvoc             float,
    voltage          float,
    primary key ((device, date), reading_type, sensor_id, processed, time)
) WITH CLUSTERING ORDER BY (reading_type ASC, sensor_id ASC, processed ASC, time DESC);
`;

const measureSetSchema = `
CREATE TABLE IF NOT EXISTS nemo_measure_set
(
	device_serial TEXT,
	bid INT,
	start_time TIMESTAMP,
	end_time TIMESTAMP,
	PRIMARY KEY ((device_serial), bid)
);
`;
