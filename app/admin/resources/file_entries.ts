import { LucidResource } from "@adminjs/adonis";

import FileEntry from "#models/file_entry";

import { Components } from "../component_loader.js";
import { readOnlyTimestamps } from "./utils/timestamps.js";

export const FileEntriesResource = {
  resource: new LucidResource(FileEntry, "postgres"),
  options: {
    navigation: "Files",
    properties: {
      ...readOnlyTimestamps,
      id: {
        isDisabled: true,
        components: {
          show: Components.FilePreview,
        },
      },
      fileExtension: { position: 10 },
      url: {
        isVisible: { list: false, filter: false, edit: false, show: true },
      },
      miniaturesUrl: {
        isVisible: { list: false, filter: false, edit: false, show: true },
      },
    },
    actions: {
      new: { isAccessible: false },
      edit: { isAccessible: false },
    },
    listProperties: ["id", "fileExtension", "createdAt"],
    showProperties: ["id", "fileExtension", "createdAt", "updatedAt"],
  },
};
