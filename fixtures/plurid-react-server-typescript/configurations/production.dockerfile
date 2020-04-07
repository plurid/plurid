FROM mhart/alpine-node:12 AS builder
WORKDIR /app
COPY . .
ENV ENV_MODE=production
RUN yarn install
RUN yarn build.production.stills


FROM mhart/alpine-node:12
WORKDIR /app
COPY --from=builder /app/build .
CMD ["yarn", "start"]
