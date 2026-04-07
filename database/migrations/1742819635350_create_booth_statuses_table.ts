import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
  protected tableName = "booth_statuses";

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments("id");
      table
        .integer("booth_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("booths")
        .onDelete("CASCADE");
      table.boolean("is_occupied").notNullable();
      table.timestamp("reported_at").notNullable();
      table.timestamp("created_at");
      table.timestamp("updated_at");

      table.index(["booth_id", "reported_at"]);
    });
  }

  async down() {
    this.schema.dropTable(this.tableName);
  }
}
