import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";

export default class AdminSessionMiddleware {
  async handle({ session, response }: HttpContext, next: NextFn) {
    const adminUser = session.get("adminUser") as unknown;

    if (adminUser === undefined || adminUser === null) {
      return response.unauthorized({ message: "Admin session required" });
    }

    await next();
  }
}
