import axios, { type AxiosInstance } from "axios";

import type {
	NemoCloudConfig,
	NemoDevice,
	NemoDeviceDetails,
	NemoDeviceMeasureSets,
	NemoMeasure,
	NemoMeasureValue,
	NemoSensor,
	Room,
} from "./types";

type LoginParams = Omit<NemoCloudConfig, "url">;

export class NemoCloudClient {
	private readonly httpClient: AxiosInstance;
	private readonly loginParams: LoginParams;

	public constructor({ url, ...config }: NemoCloudConfig) {
		this.httpClient = axios.create({
			baseURL: `${url}/AirQualityAPI`,
			timeout: 120_000,
			headers: {
				"Accept-version": "v4",
			},
		});
		this.loginParams = config;
	}

	public newSession(): NemoCloudSession {
		return new NemoCloudSession(this.httpClient, this.loginParams);
	}
}

export class NemoCloudSession {
	private readonly httpClient: AxiosInstance;
	private readonly loginParams: LoginParams;

	constructor(httpClient: AxiosInstance, loginParams: LoginParams) {
		this.httpClient = httpClient;
		this.loginParams = loginParams;
	}

	/**
	 * Normally the session id should be reused in subsequent API calls,
	 * but it's better to use a new session id for each API call
	 * because the cloud server may restart in the middle of the migration.
	 * In this case the cloud server rejects all previous sessions so that all subsequent requests will fail.
	 *
	 * @private
	 */
	private async sessionId(): Promise<string> {
		return await this.login();
	}

	/**
	 * Must be called to access other API endpoints. Session expires after 30 min of inactivity.
	 * The authentication is performed using the HTPP Digest access scheme described in authentication and security section.
	 *
	 * The digest string calculated using account info doesn't work,
	 * but the example digest string works somehow.
	 */
	public async login(): Promise<string> {
		const resp = await this.httpClient.post<{ sessionId: string }>(
			"/session/login",
			this.loginParams,
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

	/**
	 * List all devices.
	 *
	 * An operator with administrator right can view all devices.
	 */
	public async devices(): Promise<NemoDevice[]> {
		const resp = await this.httpClient.get<NemoDevice[]>("/devices/", {
			headers: {
				sessionId: await this.sessionId(),
			},
		});

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
	public async device(deviceSerialNumber: string): Promise<NemoDeviceDetails> {
		const resp = await this.httpClient.get<NemoDeviceDetails>(
			`/devices/${deviceSerialNumber}`,
			{
				headers: {
					sessionId: await this.sessionId(),
				},
			},
		);

		return resp.data;
	}

	/**
	 * Get a measureSet list by device.
	 * The values returned correspond to the data to which the operator is associated.
	 */
	public async measureSets(
		options: GetMeasureSetsOptions,
	): Promise<NemoDeviceMeasureSets[]> {
		const resp = await this.httpClient.get<NemoDeviceMeasureSets[]>(
			"/measureSets/",
			{
				headers: {
					sessionId: await this.sessionId(),
				},
				params: options,
			},
		);

		return resp.status === 204 ? [] : resp.data;
	}

	/**
	 * Get the measures information associate to a measureSet BID. Get the BID of measure and associated variable
	 *
	 * @param measureSetBid The measureSet’s BID as returned by the returned by the /measureSets/ endpoint
	 */
	public async measures(measureSetBid: number): Promise<NemoMeasure[]> {
		const resp = await this.httpClient.get<NemoMeasure[]>(
			`/measureSets/${measureSetBid}/measures`,
			{
				headers: {
					sessionId: await this.sessionId(),
				},
			},
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
			`/measures/${measureBid}/values`,
			{
				headers: {
					sessionId: await this.sessionId(),
				},
			},
		);
		return resp.data || [];
	}

	public async measureSetSensor(measureSetBid: number): Promise<NemoSensor> {
		const resp = await this.httpClient.get<NemoSensor>(
			`/measureSets/${measureSetBid}/sensors`,
			{
				headers: {
					sessionId: await this.sessionId(),
				},
			},
		);
		return resp.data;
	}

	public async room(roomBid: number) {
		const resp = await this.httpClient.get<Room>(`/rooms/${roomBid}`, {
			headers: {
				sessionId: await this.sessionId(),
			},
		});

		return resp.data;
	}
}

export type GetMeasureSetsOptions = {
	/**
	 * The device’s serial number as returned by the `/devices` endpoint.
	 */
	deviceSerialNumber?: string;
	/**
	 * The start time of the measureSet realize by the device, in seconds since the UnixEpoch.
	 */
	start?: number;
	/**
	 * The end time of the measureSet realize by the device, in seconds since the UnixEpoch.
	 */
	end?: number;
};
