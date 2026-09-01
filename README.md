# Astro + React + TypeScript + shadcn/ui (Monorepo)

This is a monorepo template for Astro with React, TypeScript, and shadcn/ui.

## Structure

- `apps/web` - Astro application
- `packages/ui` - Shared UI components (shadcn/ui)

## Adding components

To add components, run the following command from the root:

```bash
npx shadcn@latest add button -c apps/web
```

## Local dev — portless (lean, Hermes-safe)

This repo uses [portless.sh](https://portless.sh) (`devDep` `portless@0.15.6`) with the turborepo wrapper pattern, **isolated from Hermes**.

- Global `node` stays `hermes` `22.22.3` (`/Users/victorvanica/.local/bin/node`) — untouched, no `PATH` change, no `.nvmrc`, `engines >=22.12.0`.
- `portless` needs `Node 24+`, so `package.json:9` `dev` is pinned to Homebrew node: `"/opt/homebrew/bin/node ./node_modules/.bin/portless"` (`26.7.0`) — other apps keep using hermes.

```bash
bun dev                 # → https://web.laborata-astro.localhost (via portless, uses brew node 26)
bun run dev:app          # → http://localhost:4321 (bare Astro, uses hermes 22)
PORTLESS=0 bun dev       # bypass proxy
/opt/homebrew/bin/node ./node_modules/.bin/portless doctor  # health check (needs 24+)
/opt/homebrew/bin/node ./node_modules/.bin/portless get web   # URL for env
/opt/homebrew/bin/node ./node_modules/.bin/portless list
```

`package.json` has `"dev": "/opt/homebrew/bin/node ./node_modules/.bin/portless"` + `"dev:app": "turbo dev"` + `"portless": { "name": "laborata-astro", "script": "dev:app" }`.
Inferred host `web.laborata-astro.localhost` (single `apps/web`). Worktree `fix-ui` → `https://fix-ui.web.laborata-astro.localhost`. LAN on-demand: `PORTLESS_LAN=1 /opt/homebrew/bin/node ./node_modules/.bin/portless`.

First `portless trust` (sudo once for `443` CA) — run with brew node: `sudo /opt/homebrew/bin/node ./node_modules/.bin/portless trust`.

## Using components

To use the components in your app, import them in an `.astro` file:

```astro
---
import { Button } from "@workspace/ui/components/button"
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Astro App</title>
  </head>
  <body>
    <div class="grid h-screen place-items-center content-center">
      <Button>Button</Button>
    </div>
  </body>
</html>
```
