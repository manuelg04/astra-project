import { z } from "zod";

const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,/;

export const setupProfileSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(7),
  avatarUrl: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.startsWith("http") || dataUrlRegex.test(v),
      "Invalid avatar format",
    ),
});
