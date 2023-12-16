import { createRoute } from "@hono/zod-openapi";
import { NameSchema } from "../../schemas/requests";
import { MessageSchema } from "../../schemas/responses";
import { Context } from "hono";
import { Env } from "../../env"; // todo where is env

export const route = createRoute({
  method: "get",
  path: "/hello/{name}",
  operationId: "helloName",
  request: {
    params: NameSchema,
  },
  responses: {
    200: {
      description: "Respond a message",
      content: {
        "application/json": {
          schema: MessageSchema,
        },
      },
    },
  },
});

export const handler = (
  c: Context<
    Env,
    "/hello/{name}",
    {
      out: {
        param: {
          name: string;
        };
      };
    }
  >
) => {
  // todo: fix type for Context
  const { name } = c.req.valid("param");

  return c.jsonT({
    message: `hello ${name}`,
  });
};
