import path from "node:path";
import url from "node:url";

export default {
  path: `${path.dirname(url.fileURLToPath(import.meta.url))}/../`,
  title: "Booth Monitor API",
  version: "1.0.0",
  description: "",
  tagIndex: 3,
  info: {
    title: "Booth Monitor API",
    version: "1.0.0",
    description:
      "Simple API for monitoring booth occupancy status. Booths send their status every minute via authenticated POST requests. If a booth doesn't send updates for 3 minutes, it's considered offline.",
  },
  snakeCase: true,
  debug: false,
  ignore: [
    "/metrics",
    "/admin/*",
    "/api/v1/swagger",
    "/api/v1/docs",
    "/",
    "/api",
    "/api/v1",
    "/api/docs",
    "/docs",
  ],
  preferredPutPatch: "PUT",
  common: {
    parameters: {},
    headers: {},
  },
  securitySchemes: {
    ApiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "x-api-token",
      description: "API token for booth authentication",
    },
  },
  authMiddlewares: ["auth"],
  defaultSecurityScheme: "ApiKeyAuth",
  persistAuthorization: true,
  showFullPath: false,
};
