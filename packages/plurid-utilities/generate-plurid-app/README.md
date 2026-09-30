# @plurid/generate-plurid-app

Generate a plurid application in one command — the shape `@plurid/plurid-kit` runs.

```
npx @plurid/generate-plurid-app                      the prompts (no arguments)
npx @plurid/generate-plurid-app my-site              straight to it (or -d my-site)
npx @plurid/generate-plurid-app my-site -m pnpm -v git --no-install
```

Node 22 or later (any 22.x: the CLI runs as ESM and needs no `require(esm)`).

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
| `[directory]`, `-d, --directory <path>` | where to write (must be empty or new); one or the other | `plurid-app` |
| `-m, --manager <name>` | `npm`, `pnpm`, `yarn` | `npm` |
| `-v, --versioning <name>` | `git`, `none` | `none` |
| `--no-install` | write the files, skip the install | installs |

TypeScript and React only: the kit's shape. Another `--language` or `--ui` is refused with a message.

## Versions

The generated `package.json` asks for the engine, the server and the kit at the versions this generator was built with (`distribution/versions.json`); bump them as you would any dependency.

## Verification

`pnpm test` (the command line, the answers, the deterministic file list, an end-to-end generation, a failed step) and the repository's `pnpm smoke.pack`, which generates an application with the packed generator (without `require(esm)`), installs it from the packed tarballs, runs its `check` (with the TypeScript it pins and with TypeScript 6), runs `plurid build`, starts it and asserts the space at `/`.
