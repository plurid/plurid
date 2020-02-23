import generateReactApp from './generateReactApp';

import {
    resolveAppDirectory,
    makeAppDirectory,
} from '../utilities';

import {
    Answers,
} from '../data/interfaces';



const generateApplication = async (
    app: any,
) => {
    switch (app.ui) {
        case 'react':
            generateReactApp(app);
    }
}


const processArguments = async (
    program: Answers,
) => {
    let directory: string;
    let language: string;
    let ui: string;
    let type: string;
    let manager: string;

    if (program.directory === undefined) {
        console.log('App directory (-a or --app) must be specified.');
        process.exit(1);
    }

    directory = resolveAppDirectory(program.directory);

    makeAppDirectory(directory);

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

    switch(program.manager) {
        case 'npm':
        case 'yarn':
            manager = program.manager;
            break;
        default:
            manager = 'yarn';
    }

    console.log('\n\tThe plurid\' application will be generated at:');
    console.log(`\t${directory}`);
    console.log('\tThe application language is:', language);
    console.log('\tThe application is based on:', ui);
    console.log('\tThe application type is:', type);
    console.log('\n');

    const application = {
        directory,
        language,
        ui,
        type,
        manager,
    };
    await generateApplication(application);
}


export default processArguments;
