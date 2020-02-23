import generateReactApp from './generateReactApp';

import {
    resolveAppDirectory,
    makeAppDirectory,
} from '../utilities';

import {
    Answers,
    Application,
    Language,
    UI,
    Type,
    Manager,
} from '../data/interfaces';

import {
    language as languageTypes,
    ui as uiTypes,
    type as typeTypes,
    manager as managerTypes,
} from '../data/constants';



const generateApplication = async (
    app: Application,
) => {
    switch (app.ui) {
        case uiTypes.react:
            generateReactApp(app);
            return;
    }
}


const processArguments = async (
    program: Answers,
) => {
    let directory: string;
    let language: Language;
    let ui: UI;
    let type: Type;
    let manager: Manager;

    if (program.directory === undefined) {
        console.log('App directory (-a or --app) must be specified.');
        process.exit(1);
    }

    directory = resolveAppDirectory(program.directory);

    makeAppDirectory(directory);

    switch(program.language.toLowerCase()) {
        case languageTypes.typescript.toLowerCase():
            language = languageTypes.typescript;
            break;
        case languageTypes.javascript.toLowerCase():
            language = languageTypes.javascript;
            break;
        default:
            language = languageTypes.typescript;
    }

    switch(program.ui.toLowerCase()) {
        case uiTypes.html.toLowerCase():
            ui = uiTypes.html;
            break;
        case uiTypes.react.toLowerCase():
            ui = uiTypes.react;
            break;
        case uiTypes.vue.toLowerCase():
            ui = uiTypes.vue;
            break;
        default:
            ui = uiTypes.react;
    }

    switch(program.type.toLowerCase()) {
        case typeTypes.client.toLowerCase():
            type = typeTypes.client;
            break;
        case typeTypes.server.toLowerCase():
            type = typeTypes.server;
            break;
        default:
            type = typeTypes.client;
    }

    switch(program.manager.toLowerCase()) {
        case managerTypes.yarn:
            manager = managerTypes.yarn;
            break;
        case managerTypes.npm.toLowerCase():
            manager = managerTypes.npm;
            break;
        default:
            manager = managerTypes.yarn;
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
