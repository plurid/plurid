FROM mhart/alpine-node:12 AS builder

WORKDIR /app

COPY . .

ENV ENV_MODE production
ENV NODE_ENV production

RUN yarn install --production false

RUN yarn build.production



FROM mhart/alpine-node:12

WORKDIR /app

ENV ENV_MODE production
ENV NODE_ENV production

ENV PORT=8080

COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts

RUN yarn install --production

CMD ["yarn", "start"]
