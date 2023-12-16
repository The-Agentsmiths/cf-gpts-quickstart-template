import { createRoute } from "@hono/zod-openapi";
import { MessageSchema } from "../../schemas/responses";
import { Context } from "hono";

export const route = 
  createRoute({
    method: "get",
    path: "/hello",
    operationId: "hello",
    responses: {
      200: {
        description: "Respond to a message",
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
    message: "hello, the time is: " + new Date().toISOString(),
  });
