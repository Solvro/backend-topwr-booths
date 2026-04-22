import { ComponentLoader } from "adminjs";

import app from "@adonisjs/core/services/app";

export const componentLoader = new ComponentLoader();

export const Components = {
  ImageUpload: componentLoader.add(
    "ImageUpload",
    app.makePath("app/admin/components/image_upload"),
  ),
  PhotoPreview: componentLoader.add(
    "PhotoPreview",
    app.makePath("app/admin/components/photo_preview"),
  ),
  FilePreview: componentLoader.add(
    "FilePreview",
    app.makePath("app/admin/components/file_preview"),
  ),
};
