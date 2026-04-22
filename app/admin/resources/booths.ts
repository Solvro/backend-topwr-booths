import { LucidResource } from "@adminjs/adonis";

import Booth from "#models/booth";

import { Components } from "../component_loader.js";
import { readOnlyTimestamps } from "./utils/timestamps.js";

export const BoothsResource = {
  resource: new LucidResource(Booth, "postgres"),
  options: {
    navigation: "Booths",
    properties: {
      ...readOnlyTimestamps,
      id: { isDisabled: true },
      externalId: { position: 10 },
      name: { position: 20 },
      localization: {
        type: "textarea",
        position: 30,
      },
      photoKey: {
        position: 40,
        description: "File UUID (without extension)",
        components: {
          edit: Components.ImageUpload,
          new: Components.ImageUpload,
          show: Components.PhotoPreview,
        },
      },
    },
    listProperties: [
      "id",
      "externalId",
      "name",
      "photoKey",
      "createdAt",
      "updatedAt",
    ],
    editProperties: ["externalId", "name", "photoKey", "localization"],
    showProperties: [
      "id",
      "externalId",
      "name",
      "photoKey",
      "localization",
      "createdAt",
      "updatedAt",
    ],
  },
};
