import path from 'path';
import fs from 'fs';



const resolveAppDirectory = (
    appPath: string,
) => {
    if (appPath) {
        return path.resolve(process.cwd(), appPath);
    } else {
        return path.resolve(process.cwd(), './plurid-app');
    }
}


const makeAppDirectory = (
    appDir: string,
) => {
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir);
    }
}


export const processArgs = async (
    program: any,
) => {
    let app: string;
    let language: string;
    let ui: string;
    let type: string;

    if (program.app === undefined) {
        console.log('App directory (-a or --app) must be specified.');
        process.exit(1);
    }

    app = resolveAppDirectory(program.app);

    makeAppDirectory(app);

    switch(program.language) {
        case 'typescript':
        case 'javascript':
            language = program.language;
            break;
        default:
            language = 'typescript';
    }

    switch(program.ui) {
        case 'html':
        case 'react':
        case 'vue':
            ui = program.ui;
            break;
        default:
            ui = 'react';
    }

    switch(program.type) {
        case 'client':
        case 'ssr':
            type = program.type;
            break;
        default:
            type = 'client';
    }

    console.log('Application will be generated at:', app);
    console.log('The application language is:', language);
    console.log('The application is based on:', ui);
    console.log('The application type is:', type);
}
