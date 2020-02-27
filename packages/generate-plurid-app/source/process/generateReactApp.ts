import path from 'path';

import fs from 'fs';

import {
    exec,
} from 'child_process';

import {
    copyDirectory,
} from '../utilities';

import {
    Application,
} from '../data/interfaces';



interface AddScriptConfiguration {
    name: string,
    value: string,
    path: string,
}

const addScript = async (
    configuration: AddScriptConfiguration,
) => {
    const {
        name,
        value,
        path,
    } = configuration;

    const file = fs.readFileSync(path);
    const jsonFile = JSON.parse(file.toString());

    if (!jsonFile.scripts) {
        jsonFile.scripts = {};
    }

    jsonFile.scripts[name] = value;

    let data = JSON.stringify(jsonFile, null, 4);
    fs.writeFileSync(path, data);
}


export const arrangePackageJSON = (
    packagePath: string,
) => {
    const file = fs.readFileSync(packagePath);
    const jsonFile = JSON.parse(file.toString());

    const name = jsonFile.name;
    const version = jsonFile.version;
    const description = 'plurid\' web application';
    const author = jsonFile.author || '';
    const privatePackage = true;
    const main = 'build/server.js';
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

    let data = JSON.stringify(updatedFile, null, 4);
    fs.writeFileSync(packagePath, data);
}



export const removeGeneratePackage = (
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


const generatePluridReactApplication = (
    app: Application,
) => {
    console.log('\n\tAdding the plurid\' packages to the React Application...');

    const requiredPluridReactPackages = [
        '@plurid/generate-plurid-app',
        '@plurid/plurid-functions',
        '@plurid/plurid-icons-react',
        '@plurid/plurid-react',
        '@plurid/plurid-themes',
        '@plurid/plurid-ui-react',
        'hammerjs',
        'react-redux',
        'redux',
        'redux-thunk',
        'styled-components',
        '@types/styled-components',
    ];

    const pluridReactPackages = requiredPluridReactPackages.join(' ');

    const yarnInstallCommand = `yarn add ${pluridReactPackages}`;
    const npmInstallCommand = `npm install ${pluridReactPackages}`;
    const installCommand = app.manager === 'Yarn'
        ? yarnInstallCommand
        : npmInstallCommand;

    exec(installCommand, {
        cwd: app.directory,
    }, () => {
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

        const base = `./node_modules/@plurid/generate-plurid-app/distribution/files/${templateFiles}`;

        const templatePublicDir = path.join(app.directory, base + '/public');
        const templateSourceDir = path.join(app.directory, base + '/src');
        copyDirectory(templatePublicDir, publicDir);
        copyDirectory(templateSourceDir, sourceDir);

        removeGeneratePackage(app);
    });
}


const generateReactClientApplication = async (
    app: Application,
) => {
    const language = app.language === 'TypeScript'
        ? '--template typescript'
        : '';

    console.log('\tGenerating the React Application...');

    const yarnCreateCommand = `yarn create react-app ${app.directory} ${language}`;
    const npmCreateCommand = `npx create-react-app ${app.directory} ${language} --use-npm`;
    const createCommand = app.manager === 'Yarn'
        ? yarnCreateCommand
        : npmCreateCommand;

    exec(createCommand, () => {
        console.log('\tReact Application generated successfully.');

        generatePluridReactApplication(app);
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
    console.log('\n\tGenerating server rendered plurid\' application.');

    const initCommand = computeInitCommand(app);

    const requiredDependencies = [
        '@plurid/generate-plurid-app',
        '@plurid/plurid-functions',
        '@plurid/plurid-icons-react',
        '@plurid/plurid-react',
        '@plurid/plurid-react-server',
        '@plurid/plurid-themes',
        '@plurid/plurid-ui-react',
        'hammerjs',
        'react',
        'react-dom',
        'react-helmet',
        'react-redux',
        'redux',
        'redux-thunk',
        'styled-components',
    ];
    const requiredDependenciesPackages = requiredDependencies.join(' ');
    const installDependenciesCommand = computeInstallDependenciesCommand(
        app,
        requiredDependenciesPackages,
    );

    const requiredDevelopmentDependencies = [
        '@babel/core',
        '@babel/preset-env',
        '@babel/preset-react',
        'babel-loader',
        'compression-webpack-plugin',
        'file-loader',
        'open',
        'rimraf',
        'source-map-loader',
        'terser-webpack-plugin',
        'webpack',
        'webpack-bundle-analyzer',
        'webpack-cli',
        'webpack-merge',
        'webpack-node-externals',
    ];
    const requiredDevelopmentTypescriptDependencies = [
        '@types/react',
        '@types/react-dom',
        '@types/react-redux',
        '@types/styled-components',
        'ts-loader',
        'typescript',
    ];
    const requiredDevelopmentDependenciesPackages = app.language === 'TypeScript'
        ? [ ...requiredDevelopmentDependencies, ...requiredDevelopmentTypescriptDependencies].join(' ')
        : requiredDevelopmentDependencies.join(' ');
    const installDevelopmentDependenciesCommand = computeInstallDevelopmentDependenciesCommand(
        app,
        requiredDevelopmentDependenciesPackages,
    );

    exec(initCommand, {
        cwd: app.directory,
    }, () => {
        console.log('\n\tInstalling dependencies...');

        exec(installDependenciesCommand, {
            cwd: app.directory,
        }, () => {
            console.log('\tDependencies installed.');

            console.log('\n\tInstalling development dependencies...');

            exec(installDevelopmentDependenciesCommand, {
                cwd: app.directory,
            }, async () => {
                console.log('\tDevelopment dependencies installed.');

                console.log('\n\tSetting up the template files...');
                // copy template files
                const templateTypeScript = 'react-typescript-server';
                const templateJavaScript = 'react-javascript-server';
                const templateFiles = app.language === 'TypeScript'
                    ? templateTypeScript
                    : templateJavaScript;

                const base = `./node_modules/@plurid/generate-plurid-app/distribution/files/${templateFiles}`;

                const templateDirectory = path.join(app.directory, base);
                copyDirectory(templateDirectory, app.directory);


                const packageJsonPath = path.join(app.directory, './package.json');

                const packageManagerRun = app.manager === 'Yarn'
                    ? 'yarn'
                    : 'npm run';

                await addScript({
                    name: 'prestart',
                    value: `${packageManagerRun} build.production`,
                    path: packageJsonPath,
                });
                await addScript({
                    name: 'start',
                    value: 'node build/server.js',
                    path: packageJsonPath,
                });
                await addScript({
                    name: 'start.development',
                    value: 'node build/server.js',
                    path: packageJsonPath,
                });
                await addScript({
                    name: 'clean',
                    value: 'rimraf ./build',
                    path: packageJsonPath,
                });
                await addScript({
                    name: 'build.client.development',
                    value: 'webpack --config scripts/webpack.client.development.js',
                    path: packageJsonPath,
                });
                await addScript({
                    name: 'build.client.production',
                    value: 'webpack --config scripts/webpack.client.production.js',
                    path: packageJsonPath,
                });
                await addScript({
                    name: 'build.server',
                    value: 'webpack --config scripts/webpack.server.js',
                    path: packageJsonPath,
                });
                await addScript({
                    name: 'build.development',
                    value: `${packageManagerRun} clean && ${packageManagerRun} build.server && ${packageManagerRun} build.client.development`,
                    path: packageJsonPath,
                });
                await addScript({
                    name: 'build.production',
                    value: `${packageManagerRun} clean && ${packageManagerRun} build.server && ${packageManagerRun} build.client.production`,
                    path: packageJsonPath,
                });

                arrangePackageJSON(packageJsonPath);

                removeGeneratePackage(app);
            });
        });
    });
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
