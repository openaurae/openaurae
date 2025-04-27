export type Sensor = {
  /**
   * The sensor’s BID.
   */
  bid: number;
  /**
   * Sensor’s serial number.
   */
  serial: string;
  /**
   * The date of manufacture of sensor, in seconds since the UnixEpoch.
   */
  manufactureDate: number;
  /**
   * The date on which the sensor was first used, in seconds since the UnixEpoch.
   */
  firstUsedDate: number;
  /**
   * The sensor Type’s BID.
   */
  sensorTypeBID: number;
  /**
   * The exposition reference.
   */
  refExposition: string;
  /**
   * Number of times a sensor is exposed.
   */
  exposedNumber: number;
};
