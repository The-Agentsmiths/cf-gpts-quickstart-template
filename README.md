Remove the `.example` from the `.wrangler.toml.example` and the `.dev.vars.example`.

```
npm install
npm run dev
```

```
npm run deploy
```

## Helpful Links

### Localhost
- OpenAPI Doc: http://localhost:8787/doc?pretty
- Swagger UI: http://localhost:8787/ui

### Cloudflare
- Worker Limits: https://developers.cloudflare.com/workers/platform/limits/#worker-limits
- Adding secrets to prod: https://developers.cloudflare.com/workers/configuration/secrets/#secrets-on-deployed-workers

### GPTs
- Create a new GPT: https://chat.openai.com/gpts/editor
- Plugins in Production: https://platform.openai.com/docs/plugins/production/plugins-in-production

### Hono
- Setup Bearer Auth in Hono: https://github.com/honojs/middleware/tree/main/packages/zod-openapi#how-to-setup-authorization

## Known Issues

Jest testing fails. Not sure why yet, but issue referenced here: https://github.com/honojs/middleware/issues/298
