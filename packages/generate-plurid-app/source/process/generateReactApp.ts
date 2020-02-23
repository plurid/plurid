import path from 'path';

import fs from 'fs';

import {
    exec,
} from 'child_process';

import {
    copyDir,
} from '../utilities';

import {
    Application,
} from '../data/interfaces';




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

    exec(`yarn add ${pluridReactPackages}`, {
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

        const base = './node_modules/@plurid/generate-plurid-app/distribution/files/react-typescript-client';

        const templatePublicDir = path.join(app.directory, base + '/public');
        const templateSourceDir = path.join(app.directory, base + '/src');
        copyDir(templatePublicDir, publicDir);
        copyDir(templateSourceDir, sourceDir);

        exec(`yarn remove @plurid/generate-plurid-app`, {
            cwd: app.directory,
        }, () => {
            console.log('\n\tAll done.');

            console.log('\n\tChange directory');
            console.log(`\n\t\tcd ${app.directory}`);
            console.log('\n\trun');
            console.log('\n\t\tyarn start');
            console.log('\n\tand enjoy.\n');
        });
    });
}


const generateReactApplication = async (
    app: Application,
) => {
    const language = app.language === 'TypeScript'
        ? '--template typescript'
        : '';

    console.log('\tGenerating the React Application...');

    exec(`yarn create react-app ${app.directory} ${language}`, () => {
        console.log('\tReact Application generated successfully.');

        generatePluridReactApplication(app);
    });
}


export default generateReactApplication;
