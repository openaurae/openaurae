import type { Device, Sensor } from "#shared/types";
import { secondsToDate } from "#shared/utils";
import { minTime } from "date-fns/constants";
import { db } from "~/server/database";
import { publish } from "~/server/mqtt/sse";
import { upsertDevice } from "~/server/utils";

import { NemoSession } from "./api";
import { type NemoVersion, nemoConfig } from "./config";
import { type Location, parseLocation } from "./location";
import { ReadingStore } from "./reading";
import type { NemoMeasureSet } from "./types";

export async function migrateNemoCloud(version: NemoVersion) {
  const account = nemoConfig[version];
  const session = await NemoSession.create(account);

  console.log(`[nemo-cloud] Start migration ${account.url}`);

  const devices = await session.devices();

  const promises = devices
    .map((device) => new NemoDeviceMigration(session, device.serial))
    .map((migration) => migration.migrate());

  await Promise.all(promises);

  console.log(`[nemo-cloud] Finish migration ${account.url}`);
}

export class NemoDeviceMigration {
  private readonly session: NemoSession;
  private readonly deviceSerial: string;

  constructor(session: NemoSession, deviceSerial: string) {
    this.session = session;
    this.deviceSerial = deviceSerial;
  }

  async migrate(): Promise<void> {
    const device = await this.getDevice();
    if (!device) {
      return;
    }

    await upsertDevice(device);

    const lastUpdate = await this.getLatestReadingTime();
    //             |
    //             V
    // <-- current --> <-- new -->
    const measureSets = [
      await this.session.deviceMeasureSetsAt(this.deviceSerial, lastUpdate),
      await this.session.deviceMeasureSetsAfter(this.deviceSerial, lastUpdate),
    ];

    for (const measureSet of measureSets) {
      await this.migrateMeasureSet(measureSet);
    }
  }

  async migrateAll(): Promise<void> {
    const device = await this.getDevice();
    if (!device) {
      return;
    }

    await upsertDevice(device);

    const measureSets = await this.session.deviceMeasureSets(this.deviceSerial);

    for (const measureSet of measureSets) {
      await this.migrateMeasureSet(measureSet);
    }
  }

  async migrateMeasureSet(measureSet: NemoMeasureSet | null) {
    if (!measureSet) {
      return;
    }

    if (await this.isMeasureSetNewOrUpdated(measureSet)) {
      const sensor = await this.getMeasureSetSensor(measureSet.bid);
      await upsertSensor(sensor);

      const readingStore = new ReadingStore(
        this.session,
        this.deviceSerial,
        sensor.id,
      );
      await readingStore.addMeasures(measureSet.bid);

      for (const reading of readingStore.allReadings()) {
        await upsertSensorReading("nemo_cloud", reading);
        publish(this.deviceSerial, reading);
      }
    }

    // Need to update db even if measureSet.bid == db.latestMeasureSet(device).bid because the end time may be extended.
    // Otherwise the latest update time won't be update and will always get the same measureSet from API.
    await this.upsertMeasureSet(measureSet);

    // console.log(
    //   `[nemo-cloud] Migrated measure set ${measureSet.bid} of device ${this.deviceSerial}`,
    // );
  }

  async getMeasureSetSensor(measureSetBid: number): Promise<Sensor> {
    const sensor = await this.session.measureSetSensor(measureSetBid);

    return {
      device_id: this.deviceSerial,
      id: sensor.serial,
      name: sensor.refExposition ?? sensor.serial,
      type: "nemo_cloud",
    };
  }

  async upsertMeasureSet({
    bid,
    start,
    end,
    valuesNumber: values_number,
  }: NemoMeasureSet): Promise<void> {
    const measureSet = {
      device_serial: this.deviceSerial,
      bid,
      values_number,
      start: secondsToDate(start),
      end: secondsToDate(end),
    };
    await db
      .insertInto("nemo_measure_sets")
      .values(measureSet)
      .onConflict((oc) =>
        oc.columns(["device_serial", "bid"]).doUpdateSet(measureSet),
      )
      .execute();
  }

  async getLatestReadingTime(): Promise<Date> {
    const result = await db
      .selectFrom("nemo_measure_sets")
      .select(["end"])
      .where("device_serial", "=", this.deviceSerial)
      .orderBy("end", "desc")
      .limit(1)
      .executeTakeFirst();

    return result?.end ?? new Date(minTime);
  }

  async isMeasureSetNewOrUpdated(measureSet: NemoMeasureSet) {
    const stored = await db
      .selectFrom("nemo_measure_sets")
      .selectAll()
      .where("device_serial", "=", this.deviceSerial)
      .where("bid", "=", measureSet.bid)
      .executeTakeFirst();

    // could be the latest measure set but end time is extended
    // in this case need re-migrate the measure set if there's new measure values
    return !stored || stored.values_number < measureSet.valuesNumber;
  }

  async getDevice(): Promise<Device | null> {
    const device = await this.session.device(this.deviceSerial);

    if (!device) {
      // console.log(`[nemo-cloud] device details ${this.deviceSerial} not found`);
      return null;
    }

    const location = await this.getDeviceLocation(device.roomBid);

    return {
      id: device.serial,
      name: device.name || device.serial,
      type: "nemo_cloud",
      latitude: device.latitude,
      longitude: device.longitude,
      is_public: false,
      user_id: null,
      ...location,
    };
  }

  async getDeviceLocation(roomBid?: number): Promise<Location> {
    if (!roomBid) {
      return {};
    }
    const room = await this.session.room(roomBid);
    return parseLocation(room?.name);
  }
}
