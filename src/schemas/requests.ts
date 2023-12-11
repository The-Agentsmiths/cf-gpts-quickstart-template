import { z } from "@hono/zod-openapi";

export const NameSchema = z.object({
  name: z.string(),
});
