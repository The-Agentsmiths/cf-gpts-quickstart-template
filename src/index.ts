import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { prettyJSON } from "hono/pretty-json";
import { bearerAuth } from "hono/bearer-auth";
import { MessageSchema, OpenAIRequestSchema } from "./schemas/responses";
import { NameSchema } from "./schemas/requests";
import { globalTimeoutRace } from "./helpers/timeout";
import { createCompletion } from "./helpers/openai";
import { route as helloRoute, handler as helloHandler } from "./routes/get/hello";
import { route as authHelloRoute, handler as authHelloHandler } from "./routes/get/authHello";
import { route as helloParamsRoute, handler as helloParamsHandler } from "./routes/get/helloParams";

const app = new OpenAPIHono();
const token = "the-agentsmiths-are-coming";
const GLOBAL_TIMEOUT = 10000; // 10 seconds

// middleware
app.use("*", prettyJSON());
app.use("/api/*", bearerAuth({ token }));

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  name: "Authorization",
  scheme: "bearer",
  in: "header",
  description: "Bearer token (example pw: " + token + ")",
});

// https://github.com/honojs/middleware/tree/main/packages/zod-openapi#how-to-access-context-in-appdoc
app.doc("/doc", (c) => ({
  info: {
    title: "CF GPTs Quickstart API",
    version: "v1",
  },
  servers: [
    {
      url: new URL(c.req.url).origin,
      description: "Current environment",
    },
  ],
  openapi: "3.1.0",
}));

// simple get example
app.openapi(
  helloRoute,
  helloHandler
);

// bearer auth example
app.openapi(
  authHelloRoute,
  authHelloHandler
);

// get example with query params
app.openapi(
  helloParamsRoute,
  helloParamsHandler
);

// long running operation example
app.openapi(
  createRoute({
    method: "get",
    path: "/long-running-operation",
    operationId: "longRunningOperation",
    description: `This operation takes a long time to complete (${(GLOBAL_TIMEOUT + 1000)/ 1000} seconds) so we set a timeout of ${GLOBAL_TIMEOUT / 1000} seconds to fail the operation.`,
    responses: {
      200: {
        description: "Successful operation",
        content: {
          "application/json": {
            schema: MessageSchema,
          },
        },
      },
      500: {
        description: "Operation timed out",
        content: {
          "application/json": {
            schema: MessageSchema,
          },
        },
      },
    },
  }),
  async (c) => {
    try {
      const result = await globalTimeoutRace(
        () => new Promise(
          (resolve, _) =>
            setTimeout(() => resolve("i did it!"), GLOBAL_TIMEOUT + 1000) // a long ms call -- imagine a long gpt call for example. Use globalTimeoutRace whenever you have a long running operation that you don't know how long it will take. Change GLOBAL_TIMEOUT + 1000 to GLOBAL_TIMEOUT - 1000 to see the method succeed.
        )
      );

      return c.jsonT({
        message: `Operation completed: ${result}`,
      });
    } catch (error: any) {
      return c.jsonT(
        {
          message: error.message,
        },
        error.status || 500
      );
    }
  }
);

// post request example
app.openapi(
  createRoute({
    method: "post",
    path: "/hello",
    operationId: "helloPost",
    request: {
      body: {
        description: "body",
        content: {
          "application/json": {
            schema: NameSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Respond a message [post]",
        content: {
          "application/json": {
            schema: MessageSchema,
          },
        },
      },
    },
  }),
  (c) => {
    const { name } = c.req.valid("json");

    return c.jsonT({
      message: `hello ${name}`,
    });
  }
);

// openai example
app.openapi(
  createRoute({
    method: "post",
    path: "/openai",
    operationId: "openai",
    description: `This operation calls the OpenAI API inside the request handler. Requires OPENAI_API_KEY to be set in the environment.`,
    request: {
      body: {
        description: "body",
        content: {
          "application/json": {
            schema: OpenAIRequestSchema,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Respond a message [post]",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                },
              },
            },
          },
        },
      },
    },
  }),
  async (c) => {
    const { messages, model } = c.req.valid("json");
    // api key is in the environment


    const completion = await createCompletion(c, messages, model);

    return c.jsonT({
      message: completion,
    });
  }
);

app.get(
  "/ui",
  swaggerUI({
    url: "/doc",
  })
);

export default app;
