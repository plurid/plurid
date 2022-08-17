// #region imports
    // #region libraries
    import fs from 'node:fs';
    import path from 'node:path';
    import {
        exec,
    } from 'node:child_process';
    // #endregion libraries


    // #region external
    import {
        Application,
    } from '../../../data/interfaces';

    import {
        manager,
    } from '../../../data/constants';

    import {
        addScript,
    } from '../../../utilities';
    // #endregion external
// #endregion imports



// #region module
export const addScriptPluridApp = async (
    app: Application,
) => {
    if (!app.deployment) {
        return;
    }

    const packageJsonPath = path.join(app.directory, './package.json');

    await addScript({
        name: 'deploy',
        value: `plurid deploy`,
        path: packageJsonPath,
    });
}


export const setupDocker = async (
    app: Application,
) => {
    if (!app.containerize) {
        return;
    }

    const dockerProductionContents =
`FROM node:16.17-alpine AS builder

ENV PORT 8080
ENV HOST 0.0.0.0
ENV NODE_ENV production
ENV ENV_MODE production

WORKDIR /app

COPY . .

RUN yarn install --production false --network-timeout 1000000
RUN yarn run build.production verbose


FROM node:16.17-alpine

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
`;

    const dockerProductionStillsContents =
`FROM node:16.17-alpine AS builder

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY . .
ENV ENV_MODE=production
RUN yarn install

RUN yarn build.production.stills \
    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app/node_modules \
    && chown -R pptruser:pptruser /app/build

USER pptruser


FROM node:16.14-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/scripts ./scripts
RUN yarn install --production
CMD ["yarn", "start"]
`;

const dockerIgnoreContents =
`node_modules
`;

    try {
        const dockerfileProductionPath = path.join(app.directory, './configurations/production.dockerfile');
        fs.writeFileSync(dockerfileProductionPath, dockerProductionContents);

        const dockerfileProductionStillsPath = path.join(app.directory, './configurations/production.stills.dockerfile');
        fs.writeFileSync(dockerfileProductionStillsPath, dockerProductionStillsContents);

        const dockerIgnorePath = path.join(app.directory, '.dockerignore');
        fs.writeFileSync(dockerIgnorePath, dockerIgnoreContents);
    } catch (error) {
        return;
    }
}


export const removeGeneratePackage = async (
    app: Application,
) => {
    const yarnUninstallCommand = `yarn remove @plurid/generate-plurid-app`;
    const npmUninstallCommand = `npm uninstall @plurid/generate-plurid-app`;
    const pnpmUninstallCommand = `pnpm uninstall @plurid/generate-plurid-app`;
    const uninstallCommand = app.manager === manager.yarn
        ? yarnUninstallCommand
        : app.manager === manager.pnpm
            ? pnpmUninstallCommand
            : npmUninstallCommand;

    exec(uninstallCommand, {
        cwd: app.directory,
    }, () => {
        console.log('\n\tAll done.');

        const relativePath = path.relative(process.cwd(), app.directory);

        console.log('\n\tChange directory');
        console.log(`\n\t\tcd ${relativePath}`);
        console.log('\n\trun');

        if (app.manager === manager.yarn) {
            console.log('\n\t\tyarn start');
        } else if (app.manager === manager.pnpm) {
            console.log('\n\t\tpnpm start');
        } else {
            console.log('\n\t\tnpm start');
        }

        console.log('\n\tand enjoy.\n');
    });
}


export const setupPluridAppYaml = async (
    app: Application,
) => {
    if (!app.deployment) {
        return;
    }

    const appName = path.relative(process.cwd(), app.directory);

    const yamlContents =
`---
# The name of the application to be used as subdomain: <name>.plurid.app
# The name needs to be unique across all plurid.app applications.
#
# Can use only letters, numbers, and hyphens (-). Dots (.) will be converted to hyphens (-).
# Cannot contain more than 64 characters.
# Cannot coincide with internet protocols, such as www, ftp.
# Cannot start or end with a hyphen (-).
name: ${appName}

# Environment in which to run the application.
# Supported: static, node, python, go.
# Default: static.
runtime: node

# Deployment region.
# Supported: us, europe.
# Default: us.
region: us
`;

    try {
        const pluridAppPath = path.join(app.directory, './configurations/plurid.app.yaml');
        fs.writeFileSync(pluridAppPath, yamlContents);
    } catch (error) {
    }
}
// #endregion module
