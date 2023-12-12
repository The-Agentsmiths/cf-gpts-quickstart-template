import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { prettyJSON } from "hono/pretty-json";
import { bearerAuth } from "hono/bearer-auth";
import { MessageSchema } from "./schemas/responses";
import { NameSchema } from "./schemas/requests";
import { globalTimeoutRace } from "./helpers/timeout";

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

app.openapi(
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
  }),
  (c) => {
    return c.jsonT({
      message: "hello, the time is: " + new Date().toISOString(),
    });
  }
);

// bearer auth example
app.openapi(
  {
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
  },
  (c) => {
    return c.jsonT({
      message:
        "hello authenticated user, the time is: " + new Date().toISOString(),
    });
  }
);

app.openapi(
  createRoute({
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
  }),
  (c) => {
    const { name } = c.req.valid("param");

    return c.jsonT({
      message: `hello ${name}`,
    });
  }
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

app.get(
  "/ui",
  swaggerUI({
    url: "/doc",
  })
);

export default app;
