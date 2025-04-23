import { z } from "zod";

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
