# Reference production image for a plurid app built with @plurid/plurid-kit.
#
# One Dockerfile per service-type (this is the SSR-web type) instead of one
# copy-pasted per app. The app is identified only by its pnpm filter, so the
# same file serves every plurid-kit web app.
#
# Build context = the applications MONOREPO ROOT (so workspace:* internal libs
# resolve from source - PIPELINE.md Decision A). Pass the app's pnpm filter:
#
#   docker build \
#     -f containers/.../<app>/configurations/production.dockerfile \
#     --build-arg APP_FILTER=@plurid/apps.containers.plurid-com.frontends.web.products.cores.denote \
#     -t <registry>/<app>:<tag> .
#
# Replaces the legacy per-app yarn/webpack `docker.production.dockerfile`.


# ---- builder: install, plurid build, then pnpm-deploy a self-contained dir ----
# node:26-alpine = the current Node line (LTS Oct 2026) and the local dev runtime
# (v26.x) -> dev/prod parity + newest patches = fewest image CVEs. Pin a digest in
# CI (`node:26-alpine@sha256:...`) for reproducible, scan-clean builds.
FROM node:26-alpine AS builder

ARG APP_FILTER
ENV NODE_ENV=production
ENV ENV_MODE=production

RUN corepack enable
WORKDIR /repo

# Copy the whole monorepo (the build context) so workspace deps are present.
COPY . .

# Install every workspace dep (incl. dev - needed to build), reproducibly.
RUN pnpm install --frozen-lockfile --prod=false

# Build the app's workspace libraries (its dependency closure), then the app
# itself via the framework. `^...` = dependencies only; the app is built by
# `plurid build` directly so this never depends on the app's "build" script name.
RUN pnpm --filter "${APP_FILTER}^..." build
RUN pnpm --filter "${APP_FILTER}" exec plurid build

# Extract a self-contained, production-only deployment (flat node_modules + the
# app's files, including the freshly built `build/`) into /deploy.
RUN pnpm --filter "${APP_FILTER}" deploy --prod /deploy


# ---- runtime: slim image, just the deployed app + `plurid start` ----
FROM node:26-alpine

ENV NODE_ENV=production
ENV ENV_MODE=production
ENV PORT=8080
ENV HOST=0.0.0.0

RUN corepack enable
WORKDIR /app

COPY --from=builder /deploy ./

EXPOSE 8080

# `plurid start` -> node build/index.js (createPluridServer reads PORT + serves
# build/client + build/public; the asset manifest points the template at the
# real emitted client bundle).
CMD ["pnpm", "exec", "plurid", "start"]
