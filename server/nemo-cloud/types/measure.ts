import z from "zod";

/**
 * Represents a set of measure of different sensors for a device during a continuous time.
 */
export type NemoMeasureSet = {
  /**
   * The measureSet’s BID
   */
  bid: number;
  /**
   * The start time of the measureSet realize by the device, in seconds since the UnixEpoch
   */
  start: number;
  /**
   * The end time of the measureSet realize by the device, in seconds since the UnixEpoch
   */
  end: number;
  /**
   * The number of variables present in the device (strictly positive integer)
   */
  variablesNumber: number;
  /**
   * The number of values measured by the device for a variable
   */
  valuesNumber: number;
  /**
   * The campaign’s name
   */
  campaign: string;
  /**
   * The city’s name
   */
  city: string;
  /**
   * The building’s name
   */
  building: string;
  /**
   * The room’s name
   */
  room: string;
  /**
   * The operator’s name
   */
  operator: string;
};

/**
 * Represents a set of values measured by a specific sensor.
 */
export type NemoMeasure = {
  measureBid: number;
  variable: MeasureVariable | null;
};

export type NemoMeasureVariable = {
  /**
   * Represent the variable for this specific measure.
   */
  structure: number;
  /**
   * Indicate on which electronic card the variable comes from [0, 14].
   */
  source: number;
  /**
   * The unique id for a variable.
   */
  id?: string;
  /**
   * The variable’s name.
   */
  name?: NemoVariableName;
  /**
   * The unit of variable.
   */
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

export const $NemoVariableName = z.enum([
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

export type NemoVariableName = z.infer<typeof $NemoVariableName>;
