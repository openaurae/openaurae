export type Room = {
  bid: number;
  /**
   * Name of the room which is manually input by the admin, otherwise would be the default value `Pièce par défaut`.
   */
  name: string;
  buildingBid: number;
};
