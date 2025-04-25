import { z } from "zod";

/* ---------- tipos ruta ---------- */
export type RouteParams = {
  brandId: string;
  spaceGroupId: string;
  postSpaceId: string;
  postId: string;
};

/* ---------- params validator ---------- */
export const paramsSchema = z.object({
  brandId: z.string().cuid(),
  spaceGroupId: z.string().cuid(),
  postSpaceId: z.string().cuid(),
  postId: z.string().cuid(),
});

/* ---------- body validator ---------- */
export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).nullable().optional(),   // ← title sí puede ser null
  message: z.string().min(1).max(10_000).optional(),         // ← NO nullable
});