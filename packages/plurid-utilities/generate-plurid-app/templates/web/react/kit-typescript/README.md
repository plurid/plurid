# __#APP_NAME#__

A plurid application generated with `@plurid/generate-plurid-app`, in the shape `@plurid/plurid-kit` runs:

```
plurid.config.ts            the one configuration (routes, shell, head, server options)
source/client/index.tsx     createPluridClient(config)
source/server/index.ts      startPluridServer(config)
source/shared/routes/       the routes and their planes
source/shared/shell/        the shell around every route
source/shared/planes/       the pages
source/server/preserves/    server-only work per request (a typed stub)
source/public/              favicon, manifest, robots — served statically
```

## Scripts

```
__#MANAGER_RUN#__ dev        esbuild client + server, the server started, rebuilt on change (port 33721)
__#MANAGER_RUN#__ build      production build → build/
__#MANAGER_RUN#__ start      node build/index.js
__#MANAGER_RUN#__ check      tsc --noEmit
```

## Where to go next

- The engine's control surface: https://github.com/plurid/plurid/blob/master/docs/CONTROL_SURFACE.md
- Getting started: https://github.com/plurid/plurid/blob/master/docs/GETTING_STARTED.md
- The kit: https://github.com/plurid/plurid/blob/master/packages/plurid-web/plurid-works/plurid-kit/README.md
