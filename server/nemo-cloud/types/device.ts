export type Device = {
  bid: number;
  serial: string;
  name: string;
};

export type DeviceDetails = Device & {
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
