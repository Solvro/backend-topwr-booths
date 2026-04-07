import assert from "node:assert";

import type { HttpContext, Request } from "@adonisjs/core/http";
import drive from "@adonisjs/drive/services/main";
import vine from "@vinejs/vine";

import FileEntry from "#models/file_entry";
import FilesService from "#services/files_service";

const getValidator = vine.compile(
  vine.object({
    params: vine.object({
      key: vine
        .string()
        .regex(/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}(?:\..+)?$/),
    }),
  }),
);

const directUploadValidator = vine.compile(
  vine.object({
    ext: vine.string().regex(/^[a-z\d]+(?:\.[a-z\d]+)*$/i),
  }),
);

export default class FilesController {
  async post({ request, response }: HttpContext) {
    let entry: FileEntry;

    if (request.request.readable) {
      entry = await this.directUpload(request);
    } else {
      entry = await this.formUpload(request);
    }

    let metadata;
    try {
      metadata = await drive.use().getMetaData(entry.keyWithExtension);
    } catch (error) {
      throw error;
    }

    if (metadata.contentLength <= 0) {
      return response.badRequest({ message: "Attempted to upload empty file" });
    }

    return response.status(201).send({ key: entry.keyWithExtension });
  }

  async get({ request }: HttpContext) {
    const {
      params: { key },
    } = await request.validateUsing(getValidator);

    return await FileEntry.findOrFail(FilesService.trimKey(key));
  }

  private async formUpload(request: Request): Promise<FileEntry> {
    const file = request.file("file");

    if (file === null) {
      throw new Error("No file provided");
    }

    assert(file.extname !== null);
    return await FilesService.uploadMultipartFile(file);
  }

  private async directUpload(request: Request): Promise<FileEntry> {
    const { ext } = await directUploadValidator.validate(request.qs());
    return await FilesService.uploadStream(request.request, ext);
  }
}
