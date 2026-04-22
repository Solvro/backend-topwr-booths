import { LucidResource } from "@adminjs/adonis";

import BoothStatus from "#models/booth_status";

import { readOnlyTimestamps } from "./utils/timestamps.js";

export const BoothStatusesResource = {
  resource: new LucidResource(BoothStatus, "postgres"),
  options: {
    navigation: "Booths",
    properties: {
      ...readOnlyTimestamps,
      id: { isDisabled: true },
      boothId: { position: 10 },
      isOccupied: { position: 20 },
      reportedAt: { position: 30 },
    },
    actions: {
      new: { isAccessible: false },
      edit: { isAccessible: false },
      delete: { isAccessible: false },
      bulkDelete: { isAccessible: false },
    },
    listProperties: ["id", "boothId", "isOccupied", "reportedAt", "createdAt"],
    showProperties: [
      "id",
      "boothId",
      "isOccupied",
      "reportedAt",
      "createdAt",
      "updatedAt",
    ],
  },
};
