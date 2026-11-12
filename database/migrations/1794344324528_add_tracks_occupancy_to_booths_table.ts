import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "booths";

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean("tracks_occupancy").notNullable().defaultTo(true);
    });
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn("tracks_occupancy");
    });
  }
}
