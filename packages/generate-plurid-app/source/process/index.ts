import generateReactApp from './generateReactApp';

import {
    resolveAppDirectory,
    makeAppDirectory,
} from '../utilities';



const generateApplication = async (
    app: any,
) => {
    switch (app.ui) {
        case 'react':
            generateReactApp(app);
    }
}


const processArguments = async (
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

    console.log('\n\tThe plurid\' application will be generated at:');
    console.log(`\t${app}`);
    console.log('\tThe application language is:', language);
    console.log('\tThe application is based on:', ui);
    console.log('\tThe application type is:', type);
    console.log('\n');

    const application = {
        directory: app,
        language,
        ui,
        type,
    };
    await generateApplication(application);
}


export default processArguments;
