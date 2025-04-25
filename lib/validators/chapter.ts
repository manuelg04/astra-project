import { z } from "zod";

/* ------------------- PARÁMETROS DE RUTA ------------------- */
export const paramsSchema = z.object({
  brandId: z.string().cuid(),
  spaceGroupId: z.string().cuid(),
  courseSpaceId: z.string().cuid(),
  courseId: z.string().cuid(),
});
export type RouteParams = z.infer<typeof paramsSchema>;

/* ------------------- BODY DEL REQUEST --------------------- */
export const createChapterSchema = z.object({
  title: z.string().min(3).max(120),
});