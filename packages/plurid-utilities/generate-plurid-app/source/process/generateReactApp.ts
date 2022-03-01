import path from 'path';

import fs from 'fs';

import {
    exec,
} from 'child_process';

import {
    services,
} from '../data/constants';

import {
    Application,
} from '../data/interfaces';

import {
    copyDirectory,
    executeCommand,
    addScript,
    loadingSpinner,
} from '../utilities';



export const setupPackageJSONReactServer = async (
    app: Application,
) => {
    const packageJsonPath = path.join(app.directory, './package.json');

    await addScript({
        name: 'start',
        value: 'node scripts start',
        path: packageJsonPath,
    });

    await addScript({
        name: 'start.local',
        value: 'node scripts start.local',
        path: packageJsonPath,
    });
    await addScript({
        name: 'watch.client',
        value: 'node scripts watch.client',
        path: packageJsonPath,
    });
    await addScript({
        name: 'watch.server',
        value: 'node scripts watch.server',
        path: packageJsonPath,
    });
    await addScript({
        name: 'watch',
        value: 'node scripts watch',
        path: packageJsonPath,
    });

    await addScript({
        name: 'clean',
        value: 'node scripts clean',
        path: packageJsonPath,
    });
    await addScript({
        name: 'lint',
        value: 'node scripts lint',
        path: packageJsonPath,
    });
    await addScript({
        name: 'test',
        value: 'node scripts test',
        path: packageJsonPath,
    });

    await addScript({
        name: 'containerize.production',
        value: 'node scripts containerize.production',
        path: packageJsonPath,
    });
    await addScript({
        name: 'containerize.production.stills',
        value: 'node scripts containerize.production.stills',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.client.local',
        value: 'node scripts build.client.local',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.client.development',
        value: 'node scripts build.client.development',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.client.production',
        value: 'node scripts build.client.production',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.server.local',
        value: 'node scripts build.server.local',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.server.development',
        value: 'node scripts build.server.development',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.server.production',
        value: 'node scripts build.server.production',
        path: packageJsonPath,
    });

    await addScript({
        name: 'build.stills',
        value: 'node scripts build.stills',
        path: packageJsonPath,
    });

    await addScript({
        name: 'build.local',
        value: 'node scripts build.local',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.local.stills',
        value: 'node scripts build.local.stills',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.development',
        value: 'node scripts build.development',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.development.stills',
        value: 'node scripts build.development.stills',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.production',
        value: 'node scripts build.production',
        path: packageJsonPath,
    });
    await addScript({
        name: 'build.production.stills',
        value: 'node scripts build.production.stills',
        path: packageJsonPath,
    });

    await addScriptPluridApp(app);

    await arrangePackageJSON(packageJsonPath);
}


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


export const setupDocker = async (
    app: Application,
) => {
    if (!app.containerize) {
        return;
    }

    const dockerProductionContents =
`FROM mhart/alpine-node:12 AS builder
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
`;

    const dockerProductionStillsContents =
`FROM node:10-slim AS builder

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


FROM mhart/alpine-node:12
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


export const setupEnvFiles = async (
    app: Application,
) => {
    if (!app.deployment) {
        return;
    }

    const envLocalContents =
`ENV_MODE=local
NODE_ENV=development
PORT=63000

PLURID_BUILD_DIRECTORY=build
PLURID_DEFAULT_VERBOSE=true
`;

    const envDevelopmentContents =
`ENV_MODE=development
NODE_ENV=development
PORT=8080

PLURID_BUILD_DIRECTORY=build
PLURID_DEFAULT_VERBOSE=false
`;

    const envProductionContents =
`ENV_MODE=production
NODE_ENV=production
PORT=8080

PLURID_BUILD_DIRECTORY=build
PLURID_DEFAULT_VERBOSE=false
`;

    try {
        const envLocalPath = path.join(app.directory, './environment/.env.local');
        fs.writeFileSync(envLocalPath, envLocalContents);
        const envDevelopmentPath = path.join(app.directory, './environment/.env.development');
        fs.writeFileSync(envDevelopmentPath, envDevelopmentContents);
        const envProductionPath = path.join(app.directory, './environment/.env.production');
        fs.writeFileSync(envProductionPath, envProductionContents);
    } catch (error) {
        return;
    }
}


export const setupVersioning = async (
    app: Application,
) => {
    if (app.versioning === 'None') {
        return;
    }

    if (app.versioning === 'Git') {
        const gitInit = 'git init';
        await executeCommand(
            gitInit,
            { cwd: app.directory },
        );
    }
}


export const arrangePackageJSON = async (
    packagePath: string,
) => {
    const file = fs.readFileSync(packagePath);
    const jsonFile = JSON.parse(file.toString());

    const name = jsonFile.name;
    const version = jsonFile.version;
    const description = 'plurid\' web application';
    const author = jsonFile.author || '';
    const privatePackage = true;
    const main = 'build/index.js';
    const scripts = jsonFile.scripts;
    const dependencies = jsonFile.dependencies;
    const devDependencies = jsonFile.devDependencies;

    const updatedFile = {
        name,
        version,
        description,
        author,
        private: privatePackage,
        main,
        scripts,
        dependencies,
        devDependencies,
    };

    const data = JSON.stringify(updatedFile, null, 4);
    fs.writeFileSync(packagePath, data);
}



export const removeGeneratePackage = async (
    app: Application,
) => {
    const yarnUninstallCommand = `yarn remove @plurid/generate-plurid-app`;
    const npmUninstallCommand = `npm uninstall @plurid/generate-plurid-app`;
    const uninstallCommand = app.manager === 'Yarn'
        ? yarnUninstallCommand
        : npmUninstallCommand;

    exec(uninstallCommand, {
        cwd: app.directory,
    }, () => {
        console.log('\n\tAll done.');

        const relativePath = path.relative(process.cwd(), app.directory);

        console.log('\n\tChange directory');
        console.log(`\n\t\tcd ${relativePath}`);
        console.log('\n\trun');

        if (app.manager === 'Yarn') {
            console.log('\n\t\tyarn start');
        } else {
            console.log('\n\t\tnpm start');
        }

        console.log('\n\tand enjoy.\n');
    });
}

export const removeUnusedAddons = async (
    app: Application,
) => {
    const graphqlService = app.services.includes(services.apollo);
    if (!graphqlService) {
        const graphqlRelativeDirectory = './source/client/App/services/graphql';
        const graphqlDirectory = path.resolve(app.directory, graphqlRelativeDirectory);

        await executeCommand(
            `rm -rf ${graphqlDirectory}`,
        );
    }

    const reduxService = app.services.includes(services.redux);
    if (!reduxService) {
        const reduxRelativeDirectory = './source/client/App/services/state';
        const reduxDirectory = path.resolve(app.directory, reduxRelativeDirectory);

        await executeCommand(
            `rm -rf ${reduxDirectory}`,
        );
    }
}

const generatePluridReactApplication = async (
    app: Application,
) => {
    console.log('\n\tAdding the plurid\' packages to the React Application...');

    const requiredPluridReactPackages = [
        '@plurid/generate-plurid-app',
        '@plurid/elementql',
        '@plurid/elementql-client-react',
        '@plurid/plurid-data',
        '@plurid/plurid-engine',
        '@plurid/plurid-functions',
        '@plurid/plurid-functions-react',
        '@plurid/plurid-icons-react',
        '@plurid/plurid-pubsub',
        '@plurid/plurid-react',
        '@plurid/plurid-themes',
        '@plurid/plurid-ui-components-react',
        '@plurid/plurid-ui-state-react',
        'hammerjs',
        'react-redux',
        'redux',
        'redux-thunk',
        'styled-components',
    ];

    const pluridReactPackages = requiredPluridReactPackages.join(' ');

    const yarnInstallCommand = `yarn add ${pluridReactPackages}`;
    const npmInstallCommand = `npm install ${pluridReactPackages}`;
    const installCommand = app.manager === 'Yarn'
        ? yarnInstallCommand
        : npmInstallCommand;

    exec(installCommand, {
        cwd: app.directory,
    }, async () => {
        console.log('\tPlurid\' packages added succesfully.');

        console.log('\n\tSetting up the template files...');

        const publicDir = path.join(app.directory, './public');
        const sourceDir = path.join(app.directory, './src');
        const gitDir = path.join(app.directory, './.git');
        fs.rmdirSync(publicDir, {recursive: true});
        fs.rmdirSync(sourceDir, {recursive: true});
        fs.rmdirSync(gitDir, {recursive: true});

        const templateTypeScript = 'react-typescript-client';
        const templateJavaScript = 'react-javascript-client';
        const templateFiles = app.language === 'TypeScript'
            ? templateTypeScript
            : templateJavaScript;

        const base = `./node_modules/@plurid/generate-plurid-app/distribution/templates/${templateFiles}`;

        const templatePublicDir = path.join(app.directory, base + '/public');
        const templateSourceDir = path.join(app.directory, base + '/src');
        copyDirectory(templatePublicDir, publicDir);
        copyDirectory(templateSourceDir, sourceDir);

        await setupPluridAppYaml(app);
        await setupDocker(app);

        await addScriptPluridApp(app);

        await removeGeneratePackage(app);
    });
}


const generateReactClientApplication = async (
    app: Application,
) => {
    const language = app.language === 'TypeScript'
        ? '--template typescript'
        : '';

    console.log('\n\tGenerating the React Application...');

    const yarnCreateCommand = `yarn create react-app ${app.directory} ${language}`;
    const npmCreateCommand = `npx create-react-app ${app.directory} ${language} --use-npm`;
    const createCommand = app.manager === 'Yarn'
        ? yarnCreateCommand
        : npmCreateCommand;

    exec(createCommand, async () => {
        console.log('\tReact Application generated successfully.');

        await generatePluridReactApplication(app);
    });
}


const computeInitCommand = (
    app: Application,
) => {
    const yarnInitCommand = `yarn init -y`;
    const npmInitCommand = `npm init -y`;
    const initCommand = app.manager === 'Yarn'
        ? yarnInitCommand
        : npmInitCommand;
    return initCommand;
}

const computeInstallDependenciesCommand = (
    app: Application,
    dependencies: string,
) => {
    const yarnInstallDependenciesCommand = `yarn add ${dependencies}`;
    const npmInstallDependenciesCommand = `npm install ${dependencies}`;
    const installDependenciesCommand = app.manager === 'Yarn'
        ? yarnInstallDependenciesCommand
        : npmInstallDependenciesCommand;
    return installDependenciesCommand;
}

const computeInstallDevelopmentDependenciesCommand = (
    app: Application,
    dependencies: string,
) => {
    const yarnInstallDevelopmentDependenciesCommand = `yarn add -D ${dependencies}`;
    const npmInstallDevelopmentDependenciesCommand = `npm install -D ${dependencies}`;
    const installDevelopmentDependenciesCommand = app.manager === 'Yarn'
        ? yarnInstallDevelopmentDependenciesCommand
        : npmInstallDevelopmentDependenciesCommand;

    return installDevelopmentDependenciesCommand;
}


const generateReactServerApplication = async (
    app: Application,
) => {
    console.log('\n\tGenerating the server rendered plurid\' application.');
    console.log('\tThe generation process should take about 3 minutes.');

    const initCommand = computeInitCommand(app);

    const graphqlService = app.services.includes(services.apollo);
    const stripeService = app.services.includes(services.stripe);

    const requiredDependencies = [
        '@plurid/generate-plurid-app',
        '@plurid/elementql',
        '@plurid/elementql-client-react',
        '@plurid/plurid-data',
        '@plurid/plurid-engine',
        '@plurid/plurid-functions',
        '@plurid/plurid-functions-react',
        '@plurid/plurid-icons-react',
        '@plurid/plurid-pubsub',
        '@plurid/plurid-react',
        '@plurid/plurid-themes',
        '@plurid/plurid-ui-components-react',
        '@plurid/plurid-ui-state-react',
        '@plurid/plurid-react-server',
        'cross-fetch',
        'cors',
        'dotenv',
        'hammerjs',
        'react',
        'react-dom',
        'react-helmet-async',
        'react-redux',
        'redux',
        'redux-thunk',
        'styled-components',
    ];
    const graphqlDependencies = graphqlService
        ? [
            '@apollo/client',
            'graphql',
            'graphql-tag',
        ] : [];
    const stripeDependencies = stripeService
        ? [
            'react-stripe-elements',
        ] : [];
    const completeRequiredDependencies = [
        ...requiredDependencies,
        ...graphqlDependencies,
        ...stripeDependencies,
    ];

    const requiredDependenciesPackages = completeRequiredDependencies.join(' ');
    const installDependenciesCommand = computeInstallDependenciesCommand(
        app,
        requiredDependenciesPackages,
    );

    const requiredDevelopmentDependencies = [
        '@types/cors',
        '@rollup/plugin-commonjs',
        '@rollup/plugin-json',
        '@rollup/plugin-node-resolve',
        '@rollup/plugin-url',
        '@vitejs/plugin-react',
        'compression-webpack-plugin',
        'concurrently',
        'copy-webpack-plugin',
        'css-loader',
        'eslint',
        'file-loader',
        'jest',
        'nodemon',
        'open',
        'redux-devtools-extension',
        'rimraf',
        'rollup',
        'rollup-plugin-peer-deps-external',
        'rollup-plugin-sourcemaps',
        'rollup-plugin-postcss',
        'rollup-plugin-terser',
        'postcss',
        'source-map-loader',
        'style-loader',
        'terser-webpack-plugin',
        'vite',
        'vite-tsconfig-paths',
        'webpack',
        'webpack-bundle-analyzer',
        'webpack-cli',
        'webpack-merge',
        'webpack-node-externals',
    ];
    const requiredDevelopmentTypescriptDependencies = [
        '@types/express',
        '@types/jest',
        '@types/node',
        '@types/react',
        '@types/react-dom',
        '@types/react-redux',
        '@types/styled-components',
        '@types/styled-components',
        '@types/react-stripe-elements',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'rollup-plugin-typescript2',
        'ts-loader',
        'ts-jest',
        'tsconfig-paths-webpack-plugin',
        'typescript',
        'typescript-plugin-styled-components',
    ];
    const requiredDevelopmentDependenciesPackages = app.language === 'TypeScript'
        ? [ ...requiredDevelopmentDependencies, ...requiredDevelopmentTypescriptDependencies].join(' ')
        : requiredDevelopmentDependencies.join(' ');
    const installDevelopmentDependenciesCommand = computeInstallDevelopmentDependenciesCommand(
        app,
        requiredDevelopmentDependenciesPackages,
    );


    await executeCommand(
        initCommand,
        { cwd: app.directory },
    );

    const directDependenciesSpinner = loadingSpinner('\tInstalling direct dependencies...').start();
    await executeCommand(
        installDependenciesCommand,
        { cwd: app.directory },
    );
    directDependenciesSpinner.stopAndPersist();
    console.log('\tDirect dependencies installed.');


    const developmentDependenciesSpinner = loadingSpinner('\tInstalling development dependencies...').start();
    await executeCommand(
        installDevelopmentDependenciesCommand,
        { cwd: app.directory },
    );
    developmentDependenciesSpinner.stopAndPersist();
    console.log('\tDevelopment dependencies installed.');


    const templateFilesSpinner = loadingSpinner('\tSetting up the template files...').start();
    const templateTypeScript = 'react-typescript-server';
    const templateJavaScript = 'react-javascript-server';
    const templateFiles = app.language === 'TypeScript'
        ? templateTypeScript
        : templateJavaScript;

    const base = `./node_modules/@plurid/generate-plurid-app/distribution/templates/web/${templateFiles}`;

    const templateDirectory = path.join(app.directory, base);
    copyDirectory(templateDirectory, app.directory);

    await setupPackageJSONReactServer(app);

    await setupPluridAppYaml(app);
    await setupDocker(app);
    await setupVersioning(app);
    await setupEnvFiles(app);

    await removeUnusedAddons(app);

    await removeGeneratePackage(app);

    templateFilesSpinner.stopAndPersist();
}


const generateReactApplication = async (
    app: Application,
) => {
    switch (app.renderer) {
        case 'Client':
            return await generateReactClientApplication(app);
        case 'Server':
            return await generateReactServerApplication(app);
    }
}


export default generateReactApplication;
