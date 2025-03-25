import {z} from "zod";

import {MetricsSchema} from "@openaurae/types";

export const NemoCloudAccountSchema = z.object({
    serverUrl: z.string().url(),
    operator: z.string(),
    password: z.string(),
    company: z.string(),
})

export type NemoCloudAccount = z.infer<typeof NemoCloudAccountSchema>;

export const NemoVariableNameSchema = z.enum([
    "Battery",
    "Formaldehyde",
    "Temperature",
    "Humidity",
    "Pressure",
    "Carbon dioxide",
    "Light Volatile Organic Compounds",
    "Particulate matter 1",
    "Particulate matter 2.5",
    "Particulate matter 4",
    "Particulate matter 10",
]);

export type NemoVariableName = z.infer<typeof NemoVariableNameSchema>;

const NemoMetricsSchema = MetricsSchema.pick({
    battery: true,
    ch2o: true,
    co2: true,
    temperature: true,
    humidity: true,
    pressure: true,
    lvocs: true,
    pm1: true,
    pm25: true,
    pm4: true,
    pm10: true,
});

export type NemoMetrics = z.infer<typeof NemoMetricsSchema>;

export const metricNameByVariableName: Record<NemoVariableName, keyof NemoMetrics> = {
    Battery: "battery",
    Formaldehyde: "ch2o",
    Temperature: "temperature",
    Humidity: "humidity", // relative humidity (Rh%),
    Pressure: "pressure",
    "Carbon dioxide": "co2",
    "Light Volatile Organic Compounds": "lvocs",
    "Particulate matter 1": "pm1",
    "Particulate matter 2.5": "pm25",
    "Particulate matter 4": "pm4",
    "Particulate matter 10": "pm10",
};

export type NemoDevice = {
    // device’s bid
    bid: number;
    // device’s serial number
    serial: string;
    // device’s name
    name: string;
};

export type NemoDeviceDetails = NemoDevice & {
    roomBid?: number;
    campaignBid: number;
    firstMeasureSet: number;
    lastMeasureSet: number;
    numberMeasureSet: number;
    latitude: number;
    longitude: number;
};

/**
 * Represents a set of measure of different sensors for a device during a continuous time.
 */
export type NemoMeasureSet = {
    // The measureSet’s BID
    bid: number;
    // The start time of the measureSet realize by the device, in seconds since the UnixEpoch
    start: number;
    // The end time of the measureSet realize by the device, in seconds since the UnixEpoch
    end: number;
    // The number of variables present in the device (strictly positive integer)
    variablesNumber: number;
    // The number of values measured by the device for a variable
    valuesNumber: number;
    // The campaign’s name
    campaign: string;
    // The city’s name
    city: string;
    // The building’s name
    building: string;
    // The room’s name
    room: string;
    // The operator’s name
    operator: string;
};

export type NemoSensor = {
    // The sensor’s BID
    bid: number;
    // Sensor’s serial number
    serial: string;
    // The date of manufacture of sensor, in seconds since the UnixEpoch
    manufactureDate: number;
    // The date on which the sensor was first used, in seconds since the UnixEpoch
    firstUsedDate: number;
    // The sensor Type’s BID
    sensorTypeBID: number;
    // The exposition reference
    refExposition: string;
    // Number of times a sensor is exposed
    exposedNumber: number;
};

export type NemoRoom = {
    bid: number;
    name: string;
    buildingBid: number;
};

/**
 * Represents a set of values measured by a specific sensor.
 */
export type NemoMeasure = {
    measureBid: number;
    variable: NemoMeasureVariable;
};

export type NemoMeasureVariable = {
    // Represent the variable for this specific measure
    structure: number;
    // Indicate on which electronic card the variable comes from [0, 14]
    source: number;
    // The unique id for a variable
    id?: string;
    // The variable’s name
    name?: NemoVariableName;
    // The unit of variable
    unit?: string;
};

export type NemoMeasureValue = {
    /**
     * The value's time of the measure associate to a device and a measureSet, in seconds since the UnixEpoch
     */
    time: number;
    /**
     * The calibrated value of measure associate to a device and a measureSet.
     *
     * Note: value may be `undefined` if value cannot be measured at the moment.
     */
    value?: number;

    /**
     * Error code of the measure
     *
     * * 0: OK
     * * 1: Sudden change in humidity
     * * 2: The sensor is too old
     * * 3: Doubtful value
     * * 4: The sensor has expired
     * * 5: Value below the detection threshold
     * * 6: Moisture is outside the specification thresholds
     * * 7: Shifted value
     * * 8: Incompatible sensor with device
     */
    errorCode?: number;
};

