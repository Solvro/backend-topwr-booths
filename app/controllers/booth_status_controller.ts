import { DateTime } from "luxon";
import assert from "node:assert";

import type { HttpContext } from "@adonisjs/core/http";
import logger from "@adonisjs/core/services/logger";

import Booth from "#models/booth";
import BoothStatus from "#models/booth_status";
import FileEntry from "#models/file_entry";
import FilesService from "#services/files_service";
import {
  createBoothValidator,
  updateBoothStatusValidator,
} from "#validators/booth_status";

export default class BoothStatusController {
  /**
   * @createBooth
   * @summary Create new booth
   * @description Create a new booth (metadata only). Requires API token authentication via x-api-token header.
   * @requestBody {"booth_id":"string","booth_name":"string","photo_key":"string?","localization":"string?"}
   * @responseBody 201 - {"booth_id":"string","booth_name":"string","photo_key":"string|null","photo_url":"string|null","photo_miniature_url":"string|null","localization":"string|null"}
   * @responseBody 409 - {"message":"string"}
   * @responseBody 401 - {"error":"string"}
   * @responseBody 500 - {"message":"string","error":"string"}
   */
  async createBooth({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(createBoothValidator);
      const photoKey =
        data.photo_key !== undefined
          ? await this.resolvePhotoKey(data.photo_key)
          : null;

      const existingBooth = await Booth.query()
        .where("externalId", data.booth_id)
        .first();

      if (existingBooth !== null) {
        return response
          .status(409)
          .json({ message: "Booth with this ID already exists" });
      }

      const booth = await Booth.create({
        externalId: data.booth_id,
        name: data.booth_name,
        photoKey,
        localization: data.localization ?? null,
      });

      await booth.load("photo");
      const photo = this.serializePhoto(booth);

      return response.status(201).json({
        booth_id: booth.externalId,
        booth_name: booth.name,
        photo_key: photo.key,
        photo_url: photo.url,
        photo_miniature_url: photo.miniatureUrl,
        localization: booth.localization,
      });
    } catch (error) {
      assert(error instanceof Error);
      logger.error("Failed to create booth", error);
      return response
        .status(500)
        .json({ message: "Failed to create booth", error: error.message });
    }
  }

  /**
   * @updateStatus
   * @summary Update booth status
   * @description Update the occupancy status of a booth. Requires API token authentication via x-api-token header. Stores status as history and upserts booth metadata.
   * @requestBody {"booth_id":"string","booth_name":"string","photo_key":"string?","localization":"string?","is_occupied":"boolean"}
   * @responseBody 200 - {"booth_id":"string","booth_name":"string","photo_key":"string|null","photo_url":"string|null","photo_miniature_url":"string|null","localization":"string|null","is_occupied":"boolean","reported_at":"timestamp","is_online":"boolean"}
   * @responseBody 400 - {"message":"string","error":"string"}
   * @responseBody 401 - {"error":"string"}
   * @responseBody 500 - {"message":"string","error":"string"}
   */
  async updateStatus({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(updateBoothStatusValidator);
      const now = DateTime.now();
      const resolvedPhotoKey =
        data.photo_key !== undefined
          ? await this.resolvePhotoKey(data.photo_key)
          : null;

      let booth = await Booth.query()
        .where("externalId", data.booth_id)
        .first();
      if (booth === null) {
        booth = await Booth.create({
          externalId: data.booth_id,
          name: data.booth_name,
          photoKey: resolvedPhotoKey,
          localization: data.localization ?? null,
        });
      } else if (
        booth.name !== data.booth_name ||
        (data.photo_key !== undefined && booth.photoKey !== resolvedPhotoKey) ||
        (data.localization !== undefined &&
          booth.localization !== data.localization)
      ) {
        booth.name = data.booth_name;
        if (data.photo_key !== undefined) {
          booth.photoKey = resolvedPhotoKey;
        }
        if (data.localization !== undefined) {
          booth.localization = data.localization;
        }
        await booth.save();
      }

      await booth.load("photo");
      const photo = this.serializePhoto(booth);

      const boothStatus = await BoothStatus.create({
        boothId: booth.id,
        isOccupied: data.is_occupied,
        reportedAt: now,
      });

      const isOnline =
        boothStatus.reportedAt >= DateTime.now().minus({ minutes: 3 });

      return response.status(200).json({
        booth_id: booth.externalId,
        booth_name: booth.name,
        photo_key: photo.key,
        photo_url: photo.url,
        photo_miniature_url: photo.miniatureUrl,
        localization: booth.localization,
        is_occupied: boothStatus.isOccupied,
        reported_at: boothStatus.reportedAt.toISO(),
        is_online: isOnline,
      });
    } catch (error) {
      assert(error instanceof Error);
      logger.error("Failed to update booth status", error);
      return response.status(500).json({
        message: "Failed to update booth status",
        error: error.message,
      });
    }
  }

  /**
   * @index
   * @summary Get latest statuses for all booths
   * @description Retrieve latest status information for all booths. is_online field indicates if booth sent update within last 3 minutes.
   * @responseBody 200 - [{"booth_id":"string","booth_name":"string","photo_key":"string|null","photo_url":"string|null","photo_miniature_url":"string|null","localization":"string|null","is_occupied":"boolean","reported_at":"timestamp","is_online":"boolean"}]
   * @responseBody 500 - {"message":"string","error":"string"}
   */
  async index({ response }: HttpContext) {
    try {
      const booths = await Booth.query().preload("photo");

      const boothsData = await Promise.all(
        booths.map(async (booth) => {
          const photo = this.serializePhoto(booth);
          const latestStatus = await BoothStatus.query()
            .where("boothId", booth.id)
            .orderBy("reportedAt", "desc")
            .first();

          if (latestStatus === null) {
            return {
              booth_id: booth.externalId,
              booth_name: booth.name,
              photo_key: photo.key,
              photo_url: photo.url,
              photo_miniature_url: photo.miniatureUrl,
              localization: booth.localization,
              is_occupied: null,
              reported_at: null,
              is_online: false,
            };
          }

          const isOnline =
            latestStatus.reportedAt >= DateTime.now().minus({ minutes: 3 });

          return {
            booth_id: booth.externalId,
            booth_name: booth.name,
            photo_key: photo.key,
            photo_url: photo.url,
            photo_miniature_url: photo.miniatureUrl,
            localization: booth.localization,
            is_occupied: latestStatus.isOccupied,
            reported_at: latestStatus.reportedAt.toISO(),
            is_online: isOnline,
          };
        }),
      );

      return response.status(200).json(boothsData);
    } catch (error) {
      assert(error instanceof Error);
      logger.error("Failed to fetch booth statuses", error);
      return response.status(500).json({
        message: "Failed to fetch booth statuses",
        error: error.message,
      });
    }
  }

  /**
   * @show
   * @summary Get single booth status
   * @description Retrieve latest status information for a specific booth by external ID.
   * @paramPath boothId - Booth identifier - @type(string)
   * @responseBody 200 - {"booth_id":"string","booth_name":"string","photo_key":"string|null","photo_url":"string|null","photo_miniature_url":"string|null","localization":"string|null","is_occupied":"boolean|null","reported_at":"timestamp|null","is_online":"boolean"}
   * @responseBody 404 - {"message":"string"}
   * @responseBody 500 - {"message":"string","error":"string"}
   */
  async show({ params, response }: HttpContext) {
    try {
      const { boothId } = params as { boothId: string };

      const booth = await Booth.query()
        .where("externalId", boothId)
        .preload("photo")
        .first();

      if (booth === null) {
        return response.status(404).json({ message: "Booth not found" });
      }
      const photo = this.serializePhoto(booth);

      const latestStatus = await BoothStatus.query()
        .where("boothId", booth.id)
        .orderBy("reportedAt", "desc")
        .first();

      if (latestStatus === null) {
        return response.status(200).json({
          booth_id: booth.externalId,
          booth_name: booth.name,
          photo_key: photo.key,
          photo_url: photo.url,
          photo_miniature_url: photo.miniatureUrl,
          localization: booth.localization,
          is_occupied: null,
          reported_at: null,
          is_online: false,
        });
      }

      const isOnline =
        latestStatus.reportedAt >= DateTime.now().minus({ minutes: 3 });

      return response.status(200).json({
        booth_id: booth.externalId,
        booth_name: booth.name,
        photo_key: photo.key,
        photo_url: photo.url,
        photo_miniature_url: photo.miniatureUrl,
        localization: booth.localization,
        is_occupied: latestStatus.isOccupied,
        reported_at: latestStatus.reportedAt.toISO(),
        is_online: isOnline,
      });
    } catch (error) {
      assert(error instanceof Error);
      logger.error("Failed to fetch booth status", error);
      return response.status(500).json({
        message: "Failed to fetch booth status",
        error: error.message,
      });
    }
  }

  private async resolvePhotoKey(photoKey: string): Promise<string | null> {
    const trimmed = FilesService.trimKey(photoKey);
    const fileEntry = await FileEntry.find(trimmed);

    if (fileEntry === null) {
      throw new Error(`Photo file with key '${photoKey}' does not exist`);
    }

    return fileEntry.id;
  }

  private serializePhoto(booth: Booth): {
    key: string | null;
    url: string | null;
    miniatureUrl: string | null;
  } {
    if (booth.photoKey === null) {
      return {
        key: null,
        url: null,
        miniatureUrl: null,
      };
    }

    return {
      key: booth.photo.keyWithExtension,
      url: booth.photo.url ?? null,
      miniatureUrl: booth.photo.miniaturesUrl ?? null,
    };
  }
}
