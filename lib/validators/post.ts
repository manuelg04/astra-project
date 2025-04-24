import { z } from "zod";

export const cuid = z.string().cuid();

export const paramsSchema = z.object({
  brandId: cuid,
  spaceGroupId: cuid,
  postSpaceId: cuid,
});

export const createPostSchema = z.object({
  title: z.string().min(2).optional(),
  message: z.string().min(1, "Message is required"),
  attachments: z
    .array(
      z.object({
        dataUrl: z
          .string()
          .refine(
            (v) =>
              v.startsWith("data:image/") ||
              v.startsWith("data:application/pdf"),
            "Attachment must be image/* or application/pdf data URL",
          ),
      }),
    )
    .max(10) // opción: máximo 10 archivos
    .optional(),
});
