import { createRoute } from "@hono/zod-openapi";
import { MessageSchema } from "../../schemas/responses";
import { Context } from "hono";

export const route = createRoute({
  method: "get",
  path: "/api/hello",
  operationId: "authHello",
  security: [
    {
      Bearer: [],
    },
  ],
  responses: {
    200: {
      description: "Respond to an authenticated message",
      content: {
        "application/json": {
          schema: MessageSchema,
        },
      },
    },
  },
});

export const handler = (c: Context) =>
  c.jsonT({
    message:
      "hello authenticated user, the time is: " + new Date().toISOString(),
  });
