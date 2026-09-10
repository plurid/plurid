# @plurid/generate-plurid-app

Generate a plurid application in one command — the shape `@plurid/plurid-kit` runs.

```
npx @plurid/generate-plurid-app                      the prompts
npx @plurid/generate-plurid-app -d my-site           straight to it
npx @plurid/generate-plurid-app -d my-site -m pnpm -v git --no-install
```

## What you get

```
my-site/
    plurid.config.ts            the one configuration (routes, shell, head, server options)
    source/client/index.tsx     createPluridClient(config)
    source/server/index.ts      startPluridServer(config)
    source/shared/routes/       the routes and their planes (a page-presentation site to start)
    source/shared/shell/        the shell around every route
    source/shared/planes/       the pages
    source/server/preserves/    server-only work per request (a typed stub)
    source/public/              favicon, manifest, robots
    package.json                dev · build · start · check · test
    tsconfig.json               the `~client` / `~server` / `~shared` aliases the kit reads
```

`npm run dev` (or `pnpm dev`, `yarn dev`) serves it on port 33721 with the client and the server rebuilt on change; `build` writes `build/`; `start` runs it.

## Flags

| flag | values | default |
| --- | --- | --- |
| `-d, --directory <path>` | where to write (must be empty or new) | `plurid-app` |
| `-m, --manager <name>` | `npm`, `pnpm`, `yarn` | `npm` |
| `-v, --versioning <name>` | `git`, `none` | `none` |
| `--no-install` | write the files, skip the install | installs |

TypeScript and React only: the kit's shape. Another `--language` or `--ui` is refused with a message.

## Versions

The generated `package.json` asks for the engine, the server and the kit at the versions this generator was built with (`distribution/versions.json`); bump them as you would any dependency.

## Verification

`pnpm test` (the answers, the deterministic file list, an end-to-end generation) and the repository's `pnpm smoke.pack`, which generates an application, installs it from the packed tarballs, runs `plurid build`, starts it and asserts the space at `/`.
