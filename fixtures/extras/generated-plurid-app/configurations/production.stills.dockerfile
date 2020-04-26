FROM node:10-slim AS builder

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update     && apt-get install -y wget gnupg     && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -     && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'     && apt-get update     && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf       --no-install-recommends     && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
ENV ENV_MODE=production
RUN yarn install

RUN yarn build.production.stills     && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser     && mkdir -p /home/pptruser/Downloads     && chown -R pptruser:pptruser /home/pptruser     && chown -R pptruser:pptruser /app/node_modules     && chown -R pptruser:pptruser /app/build

USER pptruser


FROM mhart/alpine-node:12
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts
RUN yarn install --production
CMD ["yarn", "start"]
