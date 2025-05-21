import { dateToSeconds } from "#shared/utils";
import { type $Fetch, ofetch } from "ofetch";

import type { NemoAccount } from "./config";
import type {
  NemoDevice,
  NemoDeviceDetails,
  NemoMeasure,
  NemoMeasureSet,
  NemoMeasureValue,
  NemoRoom,
  NemoSensor,
} from "./types";

export class NemoSession {
  private readonly account: Omit<NemoAccount, "url">;
  private fetch: $Fetch;

  private constructor({ url, ...account }: NemoAccount) {
    this.account = account;
    this.fetch = ofetch.create({
      baseURL: `${url}/AirQualityAPI`,
      headers: {
        "Accept-version": "v4",
      },
    });
  }

  static async create(account: NemoAccount): Promise<NemoSession> {
    const session = new NemoSession(account);
    await session.login();

    return session;
  }

  /**
   * Must be called to access other API endpoints.
   * Session expires after 30 min of inactivity.
   */
  public async login(): Promise<void> {
    const { sessionId } = await this.fetch<{ sessionId: string }>(
      "/session/login",
      {
        method: "POST",
        body: this.account,
        headers: {
          // got 401 if using MD5(A1:nonce:A2), but the example value in the API docs works...
          Authorization:
            "Digest username=Test,realm=Authorized users of etheraApi,nonce=33e4dbaf2b2fd2c78769b436ffbe9d05,uri=/AirQualityAPI/session/login,response=b9e580f4f3b9d8ffd9205f58f5e18ee8,opaque=f8333b33f212bae4ba905cea2b4819e6",
        },
      },
    );

    this.fetch = this.fetch.create({
      headers: {
        sessionId,
      },
    });
  }

  /**
   * List all devices.
   *
   * An operator with administrator right can view all devices.
   */
  public async devices(): Promise<NemoDevice[]> {
    return await this.fetch<NemoDevice[]>("/devices");
  }

  /**
   * Get information measure about a device, the name, the serial, the bid, the associated operator,
   * the device's comment, the last campaign bid associated to the device, the last room bid associated to the device,
   * the first measureSet, the last measureSet and the number of measureSet for a specific device.
   *
   * The values returned correspond to the data to which the operator is associated.
   * @param deviceSerialNumber
   */
  public async device(
    deviceSerialNumber: string,
  ): Promise<NemoDeviceDetails | null> {
    const device = await this.fetch<NemoDeviceDetails | undefined>(
      `/devices/${deviceSerialNumber}`,
    );

    return device ?? null;
  }

  /**
   * Get information about a room, the name, the building bid, and the typical week bid.
   *
   * @param roomBid The room’s BID. This bid must correspond to an existing room
   */
  public async room(roomBid: number): Promise<NemoRoom> {
    return await this.fetch<NemoRoom>(`/rooms/${roomBid}`);
  }

  /**
   * Query measure sets.
   *
   * Return an array where each element includes measure sets of a single device.
   */
  public async measureSets(
    options: { deviceSerialNumber?: string; start?: number; end?: number } = {},
  ): Promise<NemoDeviceMeasureSetsList> {
    const sets = await this.fetch<NemoDeviceMeasureSetsList | undefined>(
      "/measureSets",
      {
        query: options,
      },
    );
    return sets ?? [];
  }

  /**
   * Get all measureSets of a device.
   * The values returned correspond to the data to which the operator is associated.
   */
  public async deviceMeasureSets(
    deviceSerialNumber: string,
  ): Promise<NemoMeasureSet[]> {
    const measureSetsList = await this.measureSets({ deviceSerialNumber });

    if (measureSetsList.length === 0) {
      return [];
    }

    return measureSetsList[0].measureSets ?? [];
  }

  /**
   * Get the first device measureSet at the given time.
   */
  public async deviceMeasureSetsAt(
    deviceSerialNumber: string,
    time: Date,
  ): Promise<NemoMeasureSet | null> {
    const seconds = dateToSeconds(time);

    const measureSet = await this.fetch<NemoMeasureSet | undefined>(
      `/devices/${deviceSerialNumber}/measureSets/atDate/${seconds}`,
    );

    return measureSet ?? null;
  }

  /**
   * Get the first device measureSet after the given time.
   */
  public async deviceMeasureSetsAfter(
    deviceSerialNumber: string,
    time: Date,
  ): Promise<NemoMeasureSet | null> {
    const seconds = dateToSeconds(time);

    const measureSet = await this.fetch<NemoMeasureSet | undefined>(
      `/devices/${deviceSerialNumber}/measureSets/afterDate/${seconds}`,
    );

    return measureSet ?? null;
  }

  public async measureSetSensor(measureSetBid: number): Promise<NemoSensor> {
    return await this.fetch<NemoSensor>(
      `/measureSets/${measureSetBid}/sensors`,
    );
  }

  /**
   * Get the measures information associate to a measureSet BID. Get the BID of measure and associated variable.
   *
   * @param measureSetBid The measureSet’s BID as returned by the returned by the /measureSets/ endpoint
   */
  public async measureSetMeasures(
    measureSetBid: number,
  ): Promise<NemoMeasure[]> {
    return await this.fetch<NemoMeasure[]>(
      `/measureSets/${measureSetBid}/measures`,
    );
  }

  /**
   * Get the time and the values associate to a measure.
   *
   * @param measureBid The measure’s bid as return by the /measureSets/{measureSetBid}/measures endpoint
   */
  public async measureValues(measureBid: number): Promise<NemoMeasureValue[]> {
    const values = await this.fetch<NemoMeasureValue[] | undefined>(
      `/measures/${measureBid}/values`,
    );
    return values ?? [];
  }
}

type NemoDeviceMeasureSetsList = {
  deviceSerialNumber: string;
  measureSets: NemoMeasureSet[];
}[];
