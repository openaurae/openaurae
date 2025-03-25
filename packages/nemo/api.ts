import axios, {type AxiosInstance} from "axios";

import type {
    NemoCloudAccount,
    NemoDevice,
    NemoDeviceDetails,
    NemoMeasure,
    NemoMeasureValue,
    NemoSensor,
    NemoRoom, NemoMeasureSet
} from "./types";

export class Session {
    private readonly httpClient: AxiosInstance;

    constructor(url: string, sessionId: string) {
        this.httpClient = axios.create({
            baseURL: `${url}/AirQualityAPI`,
            timeout: 120_000,
            headers: {
                "Accept-version": "v4",
                "sessionId": sessionId
            },
        });
    }

    /**
     * List all devices.
     *
     * An operator with administrator right can view all devices.
     */
    public async devices(): Promise<NemoDevice[]> {
        const resp = await this.httpClient.get<NemoDevice[]>("/devices/");

        return resp.data;
    }

    /**
     * Get information measure about a device, the name, the serial, the bid, the associated operator,
     * the device's comment, the last campaign bid associated to the device, the last room bid associated to the device,
     * the first measureSet, the last measureSet and the number of measureSet for a specific device.
     *
     * The values returned correspond to the data to which the operator is associated.
     * @param deviceSerialNumber
     */
    public async device(deviceSerialNumber: string): Promise<NemoDeviceDetails | null> {
        const resp = await this.httpClient.get<NemoDeviceDetails>(
            `/devices/${deviceSerialNumber}`
        );

        return resp.status === 204 ? null : resp.data;
    }

    /**
     * Get information about a room, the name, the building bid, and the typical week bid.
     *
     * @param roomBid The room’s BID. This bid must correspond to an existing room
     */
    public async room(roomBid: number): Promise<NemoRoom> {
        const resp = await this.httpClient.get<NemoRoom>(`/rooms/${roomBid}`);

        return resp.data;
    }

    /**
     * Get measure sets.
     *
     * Return an array where each element includes measure sets of a single device.
     */
    public async measureSets(
        options: { deviceSerialNumber?: string; start?: number; end?: number; } = {},
    ): Promise<{
        deviceSerialNumber: string;
        measureSets: NemoMeasureSet[];
    }[]> {
        const resp = await this.httpClient.get<{
            deviceSerialNumber: string;
            measureSets: NemoMeasureSet[];
        }[]>(
            "/measureSets/",
            {
                params: options,
            },
        );

        return resp.status === 204 ? [] : resp.data;
    }

    /**
     * Get a measureSet list of a device.
     * The values returned correspond to the data to which the operator is associated.
     */
    public async deviceMeasureSets(deviceSerialNumber: string): Promise<NemoMeasureSet[]> {
        const measureSetsList = await this.measureSets({deviceSerialNumber});

        if (measureSetsList.length == 0) {
            return [];
        }

        return measureSetsList[0].measureSets ?? [];
    }

    public async measureSetSensor(measureSetBid: number): Promise<NemoSensor> {
        const resp = await this.httpClient.get<NemoSensor>(
            `/measureSets/${measureSetBid}/sensors`
        );
        return resp.data;
    }

    /**
     * Get the measures information associate to a measureSet BID. Get the BID of measure and associated variable
     *
     * @param measureSetBid The measureSet’s BID as returned by the returned by the /measureSets/ endpoint
     */
    public async measures(measureSetBid: number): Promise<NemoMeasure[]> {
        const resp = await this.httpClient.get<NemoMeasure[]>(
            `/measureSets/${measureSetBid}/measures`
        );
        return resp.data;
    }

    /**
     * Get the time and the values associate to a measure
     *
     * @param measureBid The measure’s bid as return by the /measureSets/{measureSetBid}/measures endpoint
     */
    public async measureValues(measureBid: number): Promise<NemoMeasureValue[]> {
        const resp = await this.httpClient.get<NemoMeasureValue[]>(
            `/measures/${measureBid}/values`
        );
        return resp.data || [];
    }
}


export async function newSession(account: NemoCloudAccount): Promise<Session> {
    const sessionId = await login(account);

    return new Session(account.serverUrl, sessionId);
}

async function login({serverUrl, ...account}: NemoCloudAccount): Promise<string> {
    const resp = await axios.post<{ sessionId: string }>(
        `${serverUrl}/AirQualityAPI/session/login`,
        account,
        {
            headers: {
                // got 401 if using MD5(A1:nonce:A2), but the example value works...
                Authorization:
                    "Digest username=Test,realm=Authorized users of etheraApi,nonce=33e4dbaf2b2fd2c78769b436ffbe9d05,uri=/AirQualityAPI/session/login,response=b9e580f4f3b9d8ffd9205f58f5e18ee8,opaque=f8333b33f212bae4ba905cea2b4819e6",
            },
        },
    );

    return resp.data.sessionId;
}