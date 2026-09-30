FROM mhart/alpine-node:12 AS builder
WORKDIR /app
COPY . .
ENV ENV_MODE=production
RUN yarn install
RUN yarn build.production


FROM mhart/alpine-node:12
WORKDIR /app
# the runtime is production too: `ENV_MODE` is the server's switch, `NODE_ENV` Express's (without it an
# error page reached through Express carried the stack)
ENV ENV_MODE=production
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts
RUN yarn install --production
CMD ["yarn", "start"]
