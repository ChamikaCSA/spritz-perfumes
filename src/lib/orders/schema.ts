import { z } from "zod";
import { addressFieldsSchema } from "@/lib/account/schema";

export const checkoutSchema = addressFieldsSchema.extend({
  email: z.string().email(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
});
