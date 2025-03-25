import {db} from "@openaurae/db";
import type {Device, NemoMeasureSet as MeasureSetRecord} from "@openaurae/types";
import {dateFromSecs, extractDate, isNil} from "@openaurae/lib";
import {newSession, Session} from "./api";
import {
    metricNameByVariableName,
    type NemoCloudAccount, type NemoDeviceDetails,
    NemoVariableNameSchema
} from "./types";
import {isEqual} from "date-fns";

/**
 * Migrate info of all devices and related sensor readings.
 *
 * @param account a valid cloud account including the cloud server URL
 */
export async function migrate(account: NemoCloudAccount): Promise<void> {
    console.log(`[migration] begin ${account.serverUrl}`);
    let session = await newSession(account);
    const devices = await session.devices();

    for (const {serial} of devices) {
        const device = await session.device(serial);
        if (device === null) {
            console.log(`[device] skipped ${serial} for missing details`);
            continue;
        }

        await upsertDevice(session, device);
        const measureSets = await session.deviceMeasureSets(serial);

        for (const measureSet of measureSets) {
            session = await newSession(account); // in case session expired
            await migrateMeasureSetIfUpdated(session, {
                device_serial: serial,
                bid: measureSet.bid,
                start_time: dateFromSecs(measureSet.start),
                end_time: dateFromSecs(measureSet.end),
            });
        }
    }
    console.log(`[migration] finished ${account.serverUrl}`);
}

async function upsertDevice(session: Session, device: NemoDeviceDetails): Promise<void> {
    const room = device.roomBid ? await session.room(device.roomBid) : null;

    await db.upsertDevice({
        id: device.serial,
        name: device.name,
        type: "nemo_cloud",
        user_id: null,
        latitude: device.latitude,
        longitude: device.longitude,
        ...parseBuildingAndRoom(room?.name),
    });
}

async function migrateMeasureSetIfUpdated(session: Session, latest: MeasureSetRecord): Promise<void> {
    const prev = await db.getNemoDeviceMeasureSet(latest.device_serial, latest.bid);

    if (prev !== null && isEqual(prev.start_time, latest.start_time) && isEqual(prev.end_time, latest.end_time)) {
        console.log(`[measure-set] skipped for no diff ${JSON.stringify(latest)}`);
        return;
    }

    const sensor = await session.measureSetSensor(latest.bid);
    await db.upsertSensor({
        device: latest.device_serial,
        id: sensor.serial,
        name: sensor.refExposition,
        type: "nemo_cloud",
    });

    await upsertMeasures(session, latest.device_serial, sensor.serial, latest.bid);
    await db.upsertNemoDeviceMeasureSet(latest);

    console.log(`[measure-set] migrated ${JSON.stringify(latest)}`);
}

async function upsertMeasures(session: Session, deviceSerial: string, sensorSerial: string, measureSetBid: number): Promise<void> {
    const measures = await session.measures(measureSetBid);

    for (const {measureBid, variable} of measures) {
        if (isNil(variable)) {
            continue;
        }

        const variableName = NemoVariableNameSchema.parse(variable.name);
        const metricName = metricNameByVariableName[variableName];
        const values = await session.measureValues(measureBid);

        for (const {time: seconds, value} of values) {
            if (isNil(value)) {
                continue;
            }

            await db.upsertSensorReading({
                device: deviceSerial,
                sensor_id: sensorSerial,
                date: extractDate(dateFromSecs(seconds)),
                time: dateFromSecs(seconds),
                reading_type: "nemo_cloud",
                processed: true,
                [metricName]: value,
            });
        }
    }
}

/**
 * Room names are manually recorded in format `<building>_<room><_Env>?`
 * such as `69_G.56_Corridor_Env` or `Staging Lab_Corner B`.
 * The default room name is `Pièce par défaut` if it is not manually updated.
 */
export function parseBuildingAndRoom(
    name: string | null | undefined,
): Pick<Device, "room" | "building"> {
    const result = name?.match(/^([^_]+?)_(.+?)(_Env)?$/);
    const [_, building, room] = result ?? [null, null, null];

    return {
        building,
        room: room?.replaceAll("_", " ") ?? null,
    };
}