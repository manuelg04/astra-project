import { z } from "zod";

export const createBrandSchema = z.object({
  name: z.string().min(2, "Name is required"),
  emoji: z.string().emoji("Invalid emoji").optional(),
  color: z
    .string()
    .regex(/^#?[0-9A-Fa-f]{6}$/, "Must be hex i.e. #AABBCC")
    .optional(),
  logoUrl: z.string().url().optional(),
});
