import { DateTime } from "luxon";
import crypto from "node:crypto";

import type { HttpContext } from "@adonisjs/core/http";
import logger from "@adonisjs/core/services/logger";

import ApiToken from "#models/api_token";

export default class AuthMiddleware {
  public async handle(
    { request, response, session }: HttpContext,
    next: () => Promise<void>,
  ) {
    if (request.method() === "GET") {
      await next();
      return;
    }

    const adminUser = session.get("adminUser") as unknown;
    if (adminUser !== undefined && adminUser !== null) {
      await next();
      return;
    }

    const token = this.extractToken(request);

    if (token === null) {
      logger.error("missing token");
      return response.unauthorized({ error: "Missing API token" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const authToken = await ApiToken.query().where("hash", hashedToken).first();

    if (authToken === null) {
      logger.error("invalid token");
      return response.unauthorized({ error: "Invalid API token" });
    }

    authToken.lastUsedAt = DateTime.now();
    await authToken.save();

    await next();
  }

  private extractToken(request: HttpContext["request"]): string | null {
    const apiTokenHeader = request.header("x-api-token");
    if (apiTokenHeader !== undefined) {
      const normalized = apiTokenHeader.trim();
      if (normalized.length > 0) {
        return normalized.replace(/^Bearer\s+/i, "").trim();
      }
    }

    const authorizationHeader = request.header("authorization");
    if (authorizationHeader !== undefined) {
      const match = /^Bearer\s+(.+)$/i.exec(authorizationHeader);
      const normalized = match?.[1]?.trim();
      if (normalized !== undefined && normalized.length > 0) {
        return normalized;
      }
    }

    return null;
  }
}
