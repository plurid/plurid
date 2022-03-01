// #region imports
    // #region libraries
    import path from 'path';

    import fs from 'fs';

    import {
        exec,
    } from 'child_process';
    // #endregion libraries


    // #region external
    import {
        Application,
    } from '../../../data/interfaces';

    import {
        copyDirectory,
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
// #endregion module



// #region exports
export default generateReactClientApplication;
// #endregion exports
