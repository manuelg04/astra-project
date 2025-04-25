import { z } from "zod";

/* ─────────────────────────  Types & Validators  ───────────────────────── */

export type RouteParams = {
  brandId: string;
  spaceGroupId: string;
  postSpaceId: string;
  postId: string;
};

/** Valida que todos los IDs vengan en formato cuid() */
export const paramsSchema = z.object({
  brandId: z.string().cuid(),
  spaceGroupId: z.string().cuid(),
  postSpaceId: z.string().cuid(),
  postId: z.string().cuid(),
});
