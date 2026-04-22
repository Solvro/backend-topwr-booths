import AutoSwagger from "adonis-autoswagger";

import router from "@adonisjs/core/services/router";

import swagger from "#config/swagger";
import { middleware } from "#start/kernel";

const BoothStatusController = () =>
  import("#controllers/booth_status_controller");
const FilesController = () => import("#controllers/files_controller");
const AdminFilesController = () =>
  import("#controllers/admin_files_controller");
const MetricsMiddleware = () => import("@solvro/solvronis-metrics");

router.get("/metrics", [MetricsMiddleware, "emitMetrics"]);

router
  .post("/admin/upload-image", [AdminFilesController, "post"])
  .use(middleware.adminSession());

router
  .group(() => {
    router
      .post("/booths", [BoothStatusController, "createBooth"])
      .use(middleware.auth());

    router.get("/files/:key", [FilesController, "get"]);
    router.post("/files", [FilesController, "post"]).use(middleware.auth());

    router.get("/booths/status", [BoothStatusController, "index"]);
    router.get("/booths/status/:boothId", [BoothStatusController, "show"]);
    router
      .post("/booths/status", [BoothStatusController, "updateStatus"])
      .use(middleware.auth());

    router.get("/swagger", async () => {
      return AutoSwagger.default.docs(router.toJSON(), swagger);
    });

    router.get("/docs", async () => {
      return AutoSwagger.default.ui("/api/v1/swagger", swagger);
    });

    router.get("/healthcheck", async () => {
      return { status: "ok", timestamp: new Date().toISOString() };
    });
  })
  .prefix("/api/v1");

const redirectPaths = ["/", "/api", "/api/v1", "/api/docs", "/docs"];
redirectPaths.forEach((path) => {
  router.get(path, async ({ response }) => {
    return response.redirect("/api/v1/docs");
  });
});
