import { z } from "@hono/zod-openapi";

export const MessageSchema = z.object({
  message: z.string(),
});

/*
schema: {
              type: "object",
              properties: {
                messages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      role: {
                        type: "string",
                        enum: ["user", "assistant", "system"],
                      },
                      content: {
                        type: "string",
                      },
                    },
                  },
                },
                model: {
                  type: "string",
                },
              },
            }
*/

export const OpenAIRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  model: z.string(),
});