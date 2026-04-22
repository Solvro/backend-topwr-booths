import type { HttpContext } from "@adonisjs/core/http";
import drive from "@adonisjs/drive/services/main";

import FilesService from "#services/files_service";

export default class AdminFilesController {
  async post({ request, response }: HttpContext) {
    const file = request.file("file");

    if (file === null) {
      return response.badRequest({ message: "No file provided" });
    }

    const entry = await FilesService.uploadMultipartFile(file);
    const metadata = await drive.use().getMetaData(entry.keyWithExtension);

    if (metadata.contentLength <= 0) {
      await FilesService.deleteFileByEntry(entry);
      return response.badRequest({ message: "Attempted to upload empty file" });
    }

    return response.status(201).send({ key: entry.keyWithExtension });
  }
}
