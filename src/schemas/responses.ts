import { z } from "@hono/zod-openapi";

export const MessageSchema = z.object({
  message: z.string(),
});
