import { z } from "zod";

export const cuid = z.string().cuid();

export const paramsSchema = z.object({
  brandId: cuid,
  spaceGroupId: cuid,
});

export const createPostSpaceSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().nullable().optional(),
});
