import { randomUUID } from "node:crypto";

import { DateTime } from "luxon";

import drive from "@adonisjs/drive/services/main";
import {
  BaseModel,
  afterFetch,
  afterFind,
  column,
  computed,
} from "@adonisjs/lucid/orm";

import { MINIATURES_DRIVE } from "#config/drive";

export const PHOTO_LIKE_EXT = ["png", "jpg", "jpeg", "webp"];

export default class FileEntry extends BaseModel {
  public static selfAssignPrimaryKey = true;

  @column({ isPrimary: true })
  declare id: string;

  @column({ columnName: "file_extension" })
  declare fileExtension: string;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @computed()
  declare url: string | undefined;

  @computed()
  declare miniaturesUrl: string | undefined;

  @computed()
  isPhoto() {
    return PHOTO_LIKE_EXT.includes(this.fileExtension);
  }

  get keyWithExtension(): string {
    return `${this.id}.${this.fileExtension}`;
  }

  async computeExtraProps() {
    this.url = await drive.use().getUrl(this.keyWithExtension);
    this.miniaturesUrl = this.isPhoto()
      ? await drive.use(MINIATURES_DRIVE).getUrl(this.keyWithExtension)
      : undefined;
  }

  @afterFetch()
  static async afterFetch(files: FileEntry[]) {
    await Promise.all(files.map((file) => file.computeExtraProps()));
  }

  @afterFind()
  static async afterFind(file: FileEntry) {
    await file.computeExtraProps();
  }

  public static createNew(extname: string | undefined): FileEntry {
    const fileEntry = new FileEntry();
    fileEntry.id = randomUUID();
    fileEntry.fileExtension =
      extname !== undefined && extname.length > 0 ? extname : "bin";
    return fileEntry;
  }

  public static async fetchKeyWithExtension(
    key: string,
  ): Promise<string | null> {
    return FileEntry.query()
      .select("file_extension")
      .where("id", key)
      .first()
      .then((value) =>
        value !== null ? `${key}.${value.fileExtension}` : null,
      );
  }
}
