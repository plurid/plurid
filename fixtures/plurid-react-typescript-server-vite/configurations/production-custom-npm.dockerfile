FROM node:16.14-alpine AS builder

ARG NPM_TOKEN
ARG NPM_REGISTRY=registry.npmjs.org

ENV PORT 8080
ENV HOST 0.0.0.0
ENV NODE_ENV production
ENV ENV_MODE production

ENV NPM_TOKEN $NPM_TOKEN
ENV NPM_REGISTRY $NPM_REGISTRY

WORKDIR /app

COPY . .

RUN ( echo "cat <<EOF" ; cat ./configurations/.npmrcx ; echo EOF ) | sh > ./.npmrc

RUN yarn install --production false --network-timeout 1000000
RUN yarn run build.production verbose




FROM node:16.14-alpine

ENV PORT 8080
ENV HOST 0.0.0.0
ENV NODE_ENV production
ENV ENV_MODE production

WORKDIR /app

COPY --from=builder /app/.npmrc ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts

RUN yarn install --production --network-timeout 1000000

CMD [ "yarn", "start" ]
