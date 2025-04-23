import { z } from "zod";

// Validación de IDs CUID (prisma cuid())
export const idParamSchema = z.string().cuid();

// Parámetros de la ruta
export const paramsSchema = z.object({
  brandId: idParamSchema,
  spaceGroupId: idParamSchema,
  courseSpaceId: idParamSchema,
});

// Esquema para crear un Course
export const createCourseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  image: z
    .string()
    .refine((v) => v.startsWith("data:image/"), "Invalid image data URL")
    .optional(),
});
