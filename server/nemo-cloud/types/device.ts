export type NemoDevice = {
  bid: number;
  serial: string;
  /**
   * Device name, COULD be `""`.
   */
  name: string;
};

export type NemoDeviceDetails = NemoDevice & {
  roomBid?: number;
  campaignBid: number;
  /**
   * Timestamp (in seconds) of the first measure set.
   */
  firstMeasureSet: number;
  /**
   * Timestamp (in seconds) of the latest measure set.
   */
  lastMeasureSet: number;
  /**
   * Number of measure sets.
   */
  numberMeasureSet: number;
  latitude: number;
  longitude: number;
};
