import axios, { type AxiosInstance } from "axios";
import type { z } from "zod";

import { formatDate } from "@openaurae/lib";
import {
	DeviceSchema,
	type Reading,
	ReadingSchema,
	SensorSchema,
	type SensorType,
} from "@openaurae/types";

const GqlDeviceSchema = DeviceSchema.omit({ type: true, user_id: true }).extend(
	{
		sensors: SensorSchema.array(),
	},
);
const GqlDevicesSchema = GqlDeviceSchema.array();

export type GqlDevice = z.infer<typeof GqlDeviceSchema>;

export type GetDevicesInput = {
	deviceId: string;
	type: SensorType;
	date: string | Date;
	processed?: boolean;
};

type GqlDevicesOutput = {
	data: {
		devices: GqlDevice[];
	};
};

const ReadingsSchema = ReadingSchema.array();

type GqlReading = Reading & { date: string; time: string };

type GqlReadingsOutput = {
	data: {
		readings: GqlReading[];
	};
};

export class AwsOpenAurae {
	private readonly client: AxiosInstance;

	public constructor() {
		this.client = axios.create({
			baseURL: "https://app.openaurae.org/api",
			timeout: 120_000,
		});
	}

	public async getDevices(): Promise<GqlDevice[]> {
		const resp = await this.client.post<GqlDevicesOutput>("/graphql", {
			operationName: null,
			variables: {},
			query: `{
  devices {
    id
    name
    latitude
    longitude
    last_record
    sensors {
      device
      id
      type
      name
      comments
      last_record
    }
  }
}
`,
		});

		const output = resp.data;

		return GqlDevicesSchema.parse(output.data.devices);
	}

	public async getDeviceReadings({
		deviceId,
		type,
		date,
		processed = true,
	}: GetDevicesInput): Promise<Reading[]> {
		const resp = await this.client.post<GqlReadingsOutput>("/graphql", {
			operationName: null,
			variables: {},
			query: `{
  readings(device: "${deviceId}", processed: ${processed}, start: "${formatDate(date)}", end: "${formatDate(date)}", type: ${type}) {
    device
    date
    reading_type
    processed
    time
    action
    angle
    angle_x
    angle_x_absolute
    angle_y
    angle_y_absolute
    angle_z
    ch2o
    co2
    consumption
    contact
    humidity
    illuminance
    ip_address
    latitude
    longitude
    occupancy
    pd05
    pd10
    pd100
    pd100g
    pd25
    pd50
    pm1
    pm10
    pm25
    pmv10
    pmv100
    pmv25
    pmv_total
    power
    sensor_id
    state
    temperature
    tvoc
    voltage
  }
}
`,
		});

		const output = resp.data;

		return ReadingsSchema.parse(output.data.readings);
	}
}
