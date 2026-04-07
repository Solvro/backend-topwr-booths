import vine from "@vinejs/vine";

export const updateBoothStatusValidator = vine.compile(
  vine.object({
    booth_id: vine.string().trim().minLength(1),
    booth_name: vine.string().trim().minLength(1),
    photo_key: vine.string().trim().optional(),
    localization: vine.string().trim().optional(),
    is_occupied: vine.boolean(),
  }),
);

export const createBoothValidator = vine.compile(
  vine.object({
    booth_id: vine.string().trim().minLength(1),
    booth_name: vine.string().trim().minLength(1),
    photo_key: vine.string().trim().optional(),
    localization: vine.string().trim().optional(),
  }),
);
