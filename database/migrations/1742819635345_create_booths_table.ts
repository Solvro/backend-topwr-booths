import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "booths";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table.string("external_id").notNullable().unique();
      table.string("name").notNullable();
      table.text("localization").nullable();
      table.uuid("photo_key").nullable();
      table.foreign("photo_key").references("id").inTable("file_entries");
      table.timestamp("created_at");
      table.timestamp("updated_at");
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
