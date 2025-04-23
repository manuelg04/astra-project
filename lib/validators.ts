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
      (v) => !v || v.startsWith("http") || dataUrlRegex.test(v),
      "Invalid avatar format",
    ),
});

export const createBrandSchema = z.object({
  name: z.string().min(2, "Name is required"),
  emoji: z.string().emoji("Invalid emoji").optional(),
  color: z
    .string()
    .regex(/^#?[0-9A-Fa-f]{6}$/, "Must be hex i.e. #AABBCC")
    .optional(),
  logoUrl: z.string().url().optional(),
});

export const createCommunitySchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    pricingType: z.enum(["FREE", "PAID"]),
    price: z
      .string()
      .regex(/^\d+$/, "Price must be an integer")
      .transform((v) => Number(v))
      .optional(),
    contentType: z.enum(["courses"]),
  })
  .superRefine((data, ctx) => {
    if (data.pricingType === "PAID" && (!data.price || data.price <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Price is required and must be greater than zero when pricingType = PAID",
        path: ["price"],
      });
    }
  });
