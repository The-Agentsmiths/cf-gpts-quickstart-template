import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

const app = new OpenAPIHono();

app.openapi(
  createRoute({
    method: "get",
    path: "/hello",
    operationId: "hello",
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
    return c.jsonT({
      message: "hello ![](https://imagedelivery.net/FVn4Kw8Yr8auy8XS7UL4RA/773bb550-d7ae-4afd-c077-eabf76dce900/public)",
    });
  }
);

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
      }
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
    console.log(c.req.valid("json"))
    const { name } = c.req.valid("json");

    return c.jsonT({
      message: `hello ${name}`,
    });
  }
);

// multipart/form-data example for binary image upload
app.openapi(
  createRoute({
    method: "post",
    path: "/image",
    operationId: "imagePost",
    request: {
      body: {
        description: "body",
        content: {
          "multipart/form-data": {
            schema: z.object({
              image: z.any(),
            }),
          },
        },
      }
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
    console.log(c.req.valid("form"))
    const { image } = c.req.valid("form");

    return c.jsonT({
      message: `hello ${image.length}`,
    });
  }
);

app.get(
  "/ui",
  swaggerUI({
    url: "/doc",
  })
);

app.doc("/doc", {
  info: {
    title: "An API",
    version: "v1",
  },
  servers: [
    {
      url: "https://my-app.bradams128.workers.dev",
      description: "Production server",
    },
    {
      url: "http://localhost:8787",
      description: "Development server",
    },
  ],
  openapi: "3.1.0",
});

export default app;
