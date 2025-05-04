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

export async function login(account: NemoAccount): Promise<NemoSession> {
  const { sessionId } = await $fetch<{ sessionId: string }>(
    "/AirQualityAPI/session/login",
    {
      method: "POST",
      body: account,
      headers: {
        // got 401 if using MD5(A1:nonce:A2), but the example value in the API docs works...
        Authorization:
          "Digest username=Test,realm=Authorized users of etheraApi,nonce=33e4dbaf2b2fd2c78769b436ffbe9d05,uri=/AirQualityAPI/session/login,response=b9e580f4f3b9d8ffd9205f58f5e18ee8,opaque=f8333b33f212bae4ba905cea2b4819e6",
      },
      baseURL: account.url,
    },
  );
  return new NemoSession(account.url, sessionId);
}

export class NemoSession {
  private readonly sessionId: string;
  private readonly baseURL: string;

  constructor(serverUrl: string, sessionId: string) {
    this.sessionId = sessionId;
    this.baseURL = `${serverUrl}/AirQualityAPI`;
  }

  /**
   * List all devices.
   *
   * An operator with administrator right can view all devices.
   */
  public async devices(): Promise<NemoDevice[]> {
    return await $fetch<NemoDevice[]>("/devices", {
      baseURL: this.baseURL,
      headers: {
        "Accept-version": "v4",
        sessionId: this.sessionId,
      },
    });
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
    const dev = await $fetch<NemoDeviceDetails | undefined>(
      `/devices/${deviceSerialNumber}`,
      {
        baseURL: this.baseURL,
        headers: {
          "Accept-version": "v4",
          sessionId: this.sessionId,
        },
      },
    );

    return dev ?? null;
  }

  /**
   * Get information about a room, the name, the building bid, and the typical week bid.
   *
   * @param roomBid The room’s BID. This bid must correspond to an existing room
   */
  public async room(roomBid: number): Promise<NemoRoom> {
    return await $fetch<NemoRoom>(`/rooms/${roomBid}`, {
      baseURL: this.baseURL,
      headers: {
        "Accept-version": "v4",
        sessionId: this.sessionId,
      },
    });
  }

  /**
   * Query measure sets.
   *
   * Return an array where each element includes measure sets of a single device.
   */
  public async measureSets(
    options: { deviceSerialNumber?: string; start?: number; end?: number } = {},
  ): Promise<NemoDeviceMeasureSetsList> {
    const sets = await $fetch<NemoDeviceMeasureSetsList | undefined>(
      "/measureSets",
      {
        query: options,
        baseURL: this.baseURL,
        headers: {
          "Accept-version": "v4",
          sessionId: this.sessionId,
        },
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

  public async measureSetSensor(measureSetBid: number): Promise<NemoSensor> {
    return await $fetch<NemoSensor>(`/measureSets/${measureSetBid}/sensors`, {
      baseURL: this.baseURL,
      headers: {
        "Accept-version": "v4",
        sessionId: this.sessionId,
      },
    });
  }

  /**
   * Get the measures information associate to a measureSet BID. Get the BID of measure and associated variable.
   *
   * @param measureSetBid The measureSet’s BID as returned by the returned by the /measureSets/ endpoint
   */
  public async measureSetMeasures(
    measureSetBid: number,
  ): Promise<NemoMeasure[]> {
    return await $fetch<NemoMeasure[]>(
      `/measureSets/${measureSetBid}/measures`,
      {
        baseURL: this.baseURL,
        headers: {
          "Accept-version": "v4",
          sessionId: this.sessionId,
        },
      },
    );
  }

  /**
   * Get the time and the values associate to a measure.
   *
   * @param measureBid The measure’s bid as return by the /measureSets/{measureSetBid}/measures endpoint
   */
  public async measureValues(measureBid: number): Promise<NemoMeasureValue[]> {
    const values = await $fetch<NemoMeasureValue[] | undefined>(
      `/measures/${measureBid}/values`,
      {
        baseURL: this.baseURL,
        headers: {
          "Accept-version": "v4",
          sessionId: this.sessionId,
        },
      },
    );
    return values ?? [];
  }
}

type NemoDeviceMeasureSetsList = {
  deviceSerialNumber: string;
  measureSets: NemoMeasureSet[];
}[];
