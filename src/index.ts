import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { Context, Hono } from "hono";
import { env, getRuntimeKey } from "hono/adapter";
import { prettyJSON } from 'hono/pretty-json'
import { bearerAuth } from 'hono/bearer-auth'

const app = new OpenAPIHono();

app.use('*', prettyJSON())

const token = 'honoiscool'

app.use('/api/*', bearerAuth({ token }))

app.openAPIRegistry.registerComponent('securitySchemes', 'securitySchemes', {
  type: 'http',
  scheme: 'bearer',
})

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
            schema: z.object({
              message: z.string(),
            }),
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

// authorized route example
/*

app.get('/api/page', (c) => {
  return c.json({ message: 'You are authorized' })
})
*/
app.openapi({
  method: "get",
  path: "/api/page",
  operationId: "page",
  security: [
    {
      bearerAuth: [
        "read",
        "write",
      ],
    },
  ],
  responses: {
    200: {
      description: "Respond to a message",
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
}, (c) => {
  return c.jsonT({
    message: "hello, the time is: " + new Date().toISOString(),
  });
});

app.openapi(
  createRoute({
    method: "get",
    path: "/hello/{name}",
    operationId: "helloName",
    request: {
      params: z.object({
        name: z.string(),
      }),
    },
    responses: {
      200: {
        description: "Respond a message",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  }),
  (c) => {
    console.log(c.req.valid("param"));
    const { name } = c.req.valid("param");

    return c.jsonT({
      message: `hello ${name}`,
    });
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
            schema: z.object({
              name: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Respond a message [post]",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
      },
    },
  }),
  (c) => {
    console.log(c.req.valid("json"));
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



// https://github.com/honojs/middleware/tree/main/packages/zod-openapi#how-to-access-context-in-appdoc
app.doc("/doc", (c) => ({
  info: {
    title: "CF GPTs Quickstart API",
    version: "v1",
  },
  servers: [
    {
      url: new URL(c.req.url).origin,
      description: 'Current environment',
    }
  ],
  openapi: "3.1.0",
}));

export default app;
