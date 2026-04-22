import { ComponentLoader } from "adminjs";

export const componentLoader = new ComponentLoader();

export const Components = {
  ImageUpload: componentLoader.add("ImageUpload", "./components/image_upload"),
  PhotoPreview: componentLoader.add(
    "PhotoPreview",
    "./components/photo_preview",
  ),
  FilePreview: componentLoader.add("FilePreview", "./components/file_preview"),
};
