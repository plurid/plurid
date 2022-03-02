FROM node:16.14-alpine AS builder

ENV PORT 8080
ENV HOST 0.0.0.0
ENV NODE_ENV production
ENV ENV_MODE production

WORKDIR /app

COPY . .

RUN yarn install --production false --network-timeout 1000000
RUN yarn run build.production verbose




FROM node:16.14-alpine

ENV PORT 8080
ENV HOST 0.0.0.0
ENV NODE_ENV production
ENV ENV_MODE production

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts

RUN yarn install --production --network-timeout 1000000

CMD [ "yarn", "start" ]
