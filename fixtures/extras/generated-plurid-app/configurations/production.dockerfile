FROM mhart/alpine-node:12 AS builder
WORKDIR /app
COPY . .
ENV ENV_MODE=production
RUN yarn install
RUN yarn build.production


FROM mhart/alpine-node:12
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts
RUN yarn install --production
CMD ["yarn", "start"]
