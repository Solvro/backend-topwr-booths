import { DateTime } from "luxon";

import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";

import Booth from "#models/booth";

export default class BoothStatus extends BaseModel {
  @column({ isPrimary: true })
  declare id: number;

  @column()
  declare boothId: number;

  @column()
  declare isOccupied: boolean;

  @column.dateTime()
  declare reportedAt: DateTime;

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime;

  @belongsTo(() => Booth)
  declare booth: BelongsTo<typeof Booth>;
}
