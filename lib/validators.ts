import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().email(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,/;

export const setupProfileSchema = z.object({
  name: z.string().min(3),
  phone: z.string().min(7),
  avatarUrl: z
    .string()
    .optional()
    .refine(
      (v) =>
        !v || v.startsWith("http") || dataUrlRegex.test(v),
      "Invalid avatar format",
    ),
});