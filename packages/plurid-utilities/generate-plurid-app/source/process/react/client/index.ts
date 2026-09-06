// #region imports
    // #region libraries
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
        executeCommand,
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


/** The package manager's program and its `add` verb, as an argument array. */
const installArguments = (
    app: Application,
    packages: string[],
): [string, string[]] => {
    if (app.manager === manager.yarn) {
        return ['yarn', ['add', ...packages]];
    }
    if (app.manager === manager.pnpm) {
        return ['pnpm', ['add', ...packages]];
    }
    return ['npm', ['install', ...packages]];
};


const generatePluridReactApplication = async (
    app: Application,
) => {
    console.log('\n\tAdding the plurid\' packages to the React Application...');

    const [file, args] = installArguments(app, requiredPluridReactPackages);
    await executeCommand(file, args, { cwd: app.directory });
    console.log('\tPlurid\' packages added succesfully.');

    console.log('\n\tSetting up the template files...');

    // only after every command succeeded: the scaffold's own files make way for the template
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
    await copyDirectory(templateDir, app.directory);

    await setupPluridAppYaml(app);
    await setupDocker(app);
    await addScriptPluridApp(app);
    await updatePackageScripts(app);
    await removeGeneratePackage(app);
}


const generateReactClientApplication = async (
    app: Application,
) => {
    const template = app.language === 'TypeScript'
        ? ['--template', 'typescript']
        : [];

    console.log('\n\tGenerating the React Application...');

    const [file, args]: [string, string[]] = app.manager === manager.yarn
        ? ['yarn', ['create', 'react-app', app.directory, ...template]]
        : app.manager === manager.pnpm
            ? ['pnpm', ['dlx', 'create-react-app', app.directory, ...template]]
            : ['npx', ['create-react-app', app.directory, ...template, '--use-npm']];

    await executeCommand(file, args);
    console.log('\tReact Application generated successfully.');
    await generatePluridReactApplication(app);
}
// #endregion module



// #region exports
export default generateReactClientApplication;
// #endregion exports
