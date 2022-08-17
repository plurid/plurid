// #region imports
    // #region libraries
    import {
        exec,
    } from 'node:child_process';
    import fs from 'node:fs';
    import path from 'node:path';
    // #endregion libraries


    // #region external
    import {
        Application,
    } from '~data/interfaces';

    import {
        manager,
    } from '~data/constants';

    import {
        copyDirectory,
        removeDirectory,
    } from '~utilities/index';

    import {
        addScriptPluridApp,
        setupDocker,
        removeGeneratePackage,
        setupPluridAppYaml,
    } from '../general';
    // #endregion external


    // #region internal
    import {
        requiredPluridReactPackages,
    } from './data';
    // #endregion internal
// #endregion imports



// #region module
const updatePackageScripts = async (
    app: Application,
) => {
    const packageJsonPath = path.join(app.directory, './package.json');

    const file = fs.readFileSync(packageJsonPath, 'utf-8');
    const updatedFile = file
        .replace(`"start": "react-scripts start",`, `"start": "GENERATE_SOURCEMAP=false react-scripts start",`)
        .replace(`"build": "react-scripts build",`, `"build": "GENERATE_SOURCEMAP=false react-scripts build",`);

    fs.writeFileSync(packageJsonPath, updatedFile);
}


const generatePluridReactApplication = async (
    app: Application,
) => {
    console.log('\n\tAdding the plurid\' packages to the React Application...');

    const pluridReactPackages = requiredPluridReactPackages.join(' ');

    const yarnInstallCommand = `yarn add ${pluridReactPackages}`;
    const npmInstallCommand = `npm install ${pluridReactPackages}`;
    const pnpmInstallCommand = `pnpm install ${pluridReactPackages}`;
    const installCommand = app.manager === manager.yarn
        ? yarnInstallCommand
        : app.manager === manager.pnpm
            ? pnpmInstallCommand
            : npmInstallCommand;

    exec(installCommand, {
        cwd: app.directory,
    }, async () => {
        console.log('\tPlurid\' packages added succesfully.');

        console.log('\n\tSetting up the template files...');

        const publicDir = path.join(app.directory, './public');
        const sourceDir = path.join(app.directory, './src');
        const gitDir = path.join(app.directory, './.git');
        await removeDirectory(publicDir);
        await removeDirectory(sourceDir);
        await removeDirectory(gitDir);

        const templateTypeScript = 'react-typescript-client';
        const templateJavaScript = 'react-javascript-client';
        const templateFiles = app.language === 'TypeScript'
            ? templateTypeScript
            : templateJavaScript;

        const base = `./node_modules/@plurid/generate-plurid-app/distribution/templates/web/react/${templateFiles}`;

        const templateDir = path.join(app.directory, base);
        copyDirectory(templateDir, app.directory);

        await setupPluridAppYaml(app);
        await setupDocker(app);

        await addScriptPluridApp(app);

        await updatePackageScripts(app);

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
    const pnpmCreateCommand = `pnpm dlx create-react-app ${app.directory} ${language}`;
    const createCommand = app.manager === manager.yarn
        ? yarnCreateCommand
        : app.manager === manager.pnpm
            ? pnpmCreateCommand
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
