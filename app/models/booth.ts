import { DateTime } from "luxon";

import { BaseModel, belongsTo, column, hasMany } from "@adonisjs/lucid/orm";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";

import BoothStatus from "#models/booth_status";
import FileEntry from "#models/file_entry";

export default class Booth extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare externalId: string;

  @column()
  declare name: string;

  @column()
  declare photoKey: string | null;

  @column()
  declare localization: string | null;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @hasMany(() => BoothStatus)
  declare statuses: HasMany<typeof BoothStatus>;

  @belongsTo(() => FileEntry, {
    localKey: "id",
    foreignKey: "photoKey",
  })
  declare photo: BelongsTo<typeof FileEntry>;
}
