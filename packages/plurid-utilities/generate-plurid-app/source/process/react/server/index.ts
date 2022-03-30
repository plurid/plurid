// #region imports
    // #region libraries
    import path from 'path';

    import fs from 'fs';
    // #endregion libraries


    // #region external
    import {
        services,
        manager,
    } from '../../../data/constants';

    import {
        Application,
    } from '../../../data/interfaces';

    import {
        copyDirectory,
        executeCommand,
        addScript,
        loadingSpinner,
    } from '../../../utilities';

    import {
        addScriptPluridApp,
        setupDocker,
        removeGeneratePackage,
        setupPluridAppYaml,
    } from '../general';
    // #endregion external
// #endregion imports



// #region module
const setupPackageJSONReactServer = async (
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


const setupEnvFiles = async (
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


const setupVersioning = async (
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


const arrangePackageJSON = async (
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



const removeUnusedAddons = async (
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


const computeInitCommand = (
    app: Application,
) => {
    const yarnInitCommand = `yarn init -y`;
    const npmInitCommand = `npm init -y`;
    const pnpmInitCommand = `pnpm init -y`;
    const initCommand = app.manager === manager.yarn
        ? yarnInitCommand
        : app.manager === manager.pnpm
            ? pnpmInitCommand
            : npmInitCommand;

    return initCommand;
}

const computeInstallDependenciesCommand = (
    app: Application,
    dependencies: string,
) => {
    const yarnInstallDependenciesCommand = `yarn add ${dependencies}`;
    const npmInstallDependenciesCommand = `npm install ${dependencies}`;
    const pnpmInstallDependenciesCommand = `pnpm install ${dependencies}`;
    const installDependenciesCommand = app.manager === manager.yarn
        ? yarnInstallDependenciesCommand
        : app.manager === manager.pnpm
            ? pnpmInstallDependenciesCommand
            : npmInstallDependenciesCommand;

    return installDependenciesCommand;
}

const computeInstallDevelopmentDependenciesCommand = (
    app: Application,
    dependencies: string,
) => {
    const yarnInstallDevelopmentDependenciesCommand = `yarn add -D ${dependencies}`;
    const npmInstallDevelopmentDependenciesCommand = `npm install -D ${dependencies}`;
    const pnpmInstallDevelopmentDependenciesCommand = `pnpm install -D ${dependencies}`;
    const installDevelopmentDependenciesCommand = app.manager === manager.yarn
        ? yarnInstallDevelopmentDependenciesCommand
        : app.manager === manager.pnpm
            ? pnpmInstallDevelopmentDependenciesCommand
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
        'tslib',
        'ts-loader',
        'ts-jest',
        'tsconfig-paths-webpack-plugin',
        'typescript',
        'typescript-plugin-styled-components',
    ];
    const requiredDevelopmentJavascriptDependencies = [
        '@babel/core',
        '@babel/preset-env',
        '@babel/preset-react',
        'babel-loader',
        '@rollup/plugin-babel',
    ];
    const requiredDevelopmentDependenciesPackages = app.language === 'TypeScript'
        ? [ ...requiredDevelopmentDependencies, ...requiredDevelopmentTypescriptDependencies].join(' ')
        : [...requiredDevelopmentDependencies, ...requiredDevelopmentJavascriptDependencies].join(' ');
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

    const base = `./node_modules/@plurid/generate-plurid-app/distribution/templates/web/react/${templateFiles}`;

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
// #endregion module



// #region exports
export default generateReactServerApplication;
// #endregion exports
