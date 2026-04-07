import type { Readable } from "node:stream";

import logger from "@adonisjs/core/services/logger";
import type { MultipartFile } from "@adonisjs/core/types/bodyparser";
import type { Disk } from "@adonisjs/drive";
import drive from "@adonisjs/drive/services/main";
import db from "@adonisjs/lucid/services/db";

import { MAIN_DRIVE, MINIATURES_DRIVE } from "#config/drive";
import FileEntry from "#models/file_entry";
import { resizeFromMultipart, resizeFromPathOrBytes } from "#utils/images";

function getMainDrive(): Disk {
  return drive.use(MAIN_DRIVE);
}

function getMiniaturesDrive(): Disk {
  return drive.use(MINIATURES_DRIVE);
}

export default class FilesService {
  static async uploadMultipartFile(file: MultipartFile): Promise<FileEntry> {
    const fileEntry = FileEntry.createNew(file.extname);
    return await db.transaction(async (trx) => {
      await fileEntry.useTransaction(trx).save();

      const miniatureSaved = await this.uploadMiniatureIfApplicable(
        () => resizeFromMultipart(file),
        fileEntry,
      );

      try {
        await file.moveToDisk(fileEntry.keyWithExtension);
        return fileEntry;
      } catch (error) {
        if (miniatureSaved) {
          await this.removeMiniatureSilently(fileEntry.keyWithExtension);
        }
        throw error;
      }
    });
  }

  static async uploadStream(
    stream: Readable,
    extname: string | undefined = undefined,
  ): Promise<FileEntry> {
    const fileEntry = FileEntry.createNew(extname);

    if (fileEntry.isPhoto()) {
      const rawData = await stream.toArray();
      const data = Buffer.concat(rawData);
      return this.uploadFromMemoryInternal(data, fileEntry);
    }

    return await db.transaction(async (trx) => {
      await fileEntry.useTransaction(trx).save();
      await getMainDrive().putStream(fileEntry.keyWithExtension, stream);
      return fileEntry;
    });
  }

  static trimKey(keyToTrim: string): string {
    const lastIndex = keyToTrim.lastIndexOf(".");
    return lastIndex > 0 ? keyToTrim.substring(0, lastIndex) : keyToTrim;
  }

  private static async uploadFromMemoryInternal(
    data: Uint8Array,
    fileEntry: FileEntry,
  ): Promise<FileEntry> {
    return await db.transaction(async (trx) => {
      await fileEntry.useTransaction(trx).save();

      const miniatureSaved = await this.uploadMiniatureIfApplicable(
        () => resizeFromPathOrBytes(data),
        fileEntry,
      );

      try {
        await getMainDrive().put(fileEntry.keyWithExtension, data);
        return fileEntry;
      } catch (error) {
        if (miniatureSaved) {
          await this.removeMiniatureSilently(fileEntry.keyWithExtension);
        }
        throw error;
      }
    });
  }

  private static async uploadMiniatureIfApplicable(
    miniatureGenerator: () => Promise<Uint8Array>,
    fileEntry: FileEntry,
  ): Promise<boolean> {
    if (!fileEntry.isPhoto()) {
      return false;
    }

    const miniatureData = await miniatureGenerator();
    await getMiniaturesDrive().put(fileEntry.keyWithExtension, miniatureData);
    return true;
  }

  private static async removeMiniatureSilently(key: string) {
    try {
      await getMiniaturesDrive().delete(key);
    } catch (error) {
      logger.error(`Failed to delete miniature ${key}`, error);
    }
  }
}
