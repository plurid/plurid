import generateReactApp from './generateReactApp';

import {
    resolveAppDirectory,
    makeAppDirectory,
} from '../utilities';

import {
    Answers,
    Application,
} from '../data/interfaces';



const generateApplication = async (
    app: Application,
) => {
    switch (app.ui) {
        case 'React':
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

    switch(program.language.toLowerCase()) {
        case 'typescript':
            language = 'TypeScript';
            break;
        case 'javascript':
            language = 'JavaScript';
            break;
        default:
            language = 'TypesSript';
    }

    switch(program.ui.toLowerCase()) {
        case 'html':
            ui = 'HTML';
            break;
        case 'react':
            ui = 'React';
            break;
        case 'vue':
            ui = 'Vue';
            break;
        default:
            ui = 'React';
    }

    switch(program.type.toLowerCase()) {
        case 'client':
            type = 'Client-Side';
            break;
        case 'ssr':
            type = 'Server-Side';
            break;
        default:
            type = 'Client-Sider';
    }

    switch(program.manager.toLowerCase()) {
        case 'npm':
            manager = 'NPM';
            break;
        case 'yarn':
            manager = 'Yarn';
            break;
        default:
            manager = 'Yarn';
    }

    console.log('\n\tThe plurid\' application will be generated at:');
    console.log(`\t${directory}`);
    console.log('\tThe application language is:', language);
    console.log('\tThe application is based on:', ui);
    console.log('\tThe application type is:', type);
    console.log('\tThe package manager is:', manager);
    console.log('\n');

    const application: Application = {
        directory,
        language,
        ui,
        type,
        manager,
    };
    await generateApplication(application);
}


export default processArguments;
