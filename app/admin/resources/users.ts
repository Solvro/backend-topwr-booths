import { LucidResource } from "@adminjs/adonis";

import User from "#models/user";

import { readOnlyTimestamps } from "./utils/timestamps.js";

export const UsersResource = {
  resource: new LucidResource(User, "postgres"),
  options: {
    navigation: "Admin",
    properties: {
      ...readOnlyTimestamps,
      id: { isDisabled: true },
      password: {
        type: "password",
        isVisible: {
          list: false,
          filter: false,
          show: false,
          edit: true,
        },
      },
    },
    listProperties: ["id", "fullName", "email", "createdAt"],
    editProperties: ["fullName", "email", "password"],
    showProperties: ["id", "fullName", "email", "createdAt", "updatedAt"],
  },
};
