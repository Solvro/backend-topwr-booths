import * as fs from "node:fs";
import path from "node:path";

import app from "@adonisjs/core/services/app";
import { defineConfig, services } from "@adonisjs/drive";

import env from "#start/env";

export const STORAGE_PATH = app.makePath("storage");
export const MINIATURES_STORAGE_PATH = app.makePath(
  path.join(STORAGE_PATH, "miniatures"),
);

export function ensureStorageDirsExist() {
  if (!fs.existsSync(MINIATURES_STORAGE_PATH)) {
    fs.mkdirSync(MINIATURES_STORAGE_PATH, { recursive: true });
  }
}

ensureStorageDirsExist();

export const MAIN_DRIVE = "fs";
export const MINIATURES_DRIVE = "miniatures";

const driveConfig = defineConfig({
  default: MAIN_DRIVE,
  services: {
    [MAIN_DRIVE]: services.fs({
      location: STORAGE_PATH,
      serveFiles: true,
      routeBasePath: "/uploads",
      visibility: "public",
      appUrl: env.get("APP_URL"),
    }),
    [MINIATURES_DRIVE]: services.fs({
      location: MINIATURES_STORAGE_PATH,
      serveFiles: true,
      routeBasePath: "/uploads/miniatures",
      visibility: "public",
      appUrl: env.get("APP_URL"),
    }),
  },
});

export default driveConfig;

declare module "@adonisjs/drive/types" {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
