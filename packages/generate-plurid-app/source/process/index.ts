import generateReactApp from './generateReactApp';

import {
    resolveAppDirectory,
    makeDirectory,
} from '../utilities';

import {
    Answers,
    Application,
    Language,
    UI,
    Renderer,
    Manager,
} from '../data/interfaces';

import {
    language as languageTypes,
    ui as uiTypes,
    renderer as rendererTypes,
    manager as managerTypes,
} from '../data/constants';



const generateApplication = async (
    app: Application,
) => {
    switch (app.ui) {
        case uiTypes.react:
            return await generateReactApp(app);
    }
}


const processArguments = async (
    program: Answers,
) => {
    try {
        let directory: string;
        let language: Language;
        let ui: UI;
        let renderer: Renderer;
        let manager: Manager;

        if (program.directory === undefined) {
            console.log('App directory (-a or --app) must be specified.');
            process.exit(1);
        }

        directory = resolveAppDirectory(program.directory);

        makeDirectory(directory);

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
            case uiTypes.angular.toLowerCase():
                ui = uiTypes.angular;
                break;
            default:
                ui = uiTypes.react;
        }

        switch(program.renderer.toLowerCase()) {
            case rendererTypes.client.toLowerCase():
                renderer = rendererTypes.client;
                break;
            case rendererTypes.server.toLowerCase():
                renderer = rendererTypes.server;
                break;
            default:
                renderer = rendererTypes.client;
        }

        switch(program.manager.toLowerCase()) {
            case managerTypes.yarn.toLowerCase():
                manager = managerTypes.yarn;
                break;
            case managerTypes.npm.toLowerCase():
                manager = managerTypes.npm;
                break;
            default:
                manager = managerTypes.yarn;
        }

        const {
            services,
            pluridApp,
        } = program;

        console.log('\n\tThe plurid\' application will be generated at:');
        console.log(`\t${directory}`);
        console.log('\tThe application language is:', language);
        console.log('\tThe application is based on:', ui);
        console.log('\tThe application rendering side is:', renderer);
        console.log('\tThe package manager is:', manager);

        if (services.length > 0) {
            const plural = services.length === 1
                ? ''
                : 's';
            const verb = services.length === 1
                ? 'is'
                : 'are';
            const servicesList = services.reduce((accumulator, service) => accumulator + ', ' + service);
            console.log(`\tThe selected service${plural} ${verb}: ${servicesList}.`);
        } else {
            console.log('\tNo selected services.');
        }

        if (pluridApp) {
            console.log('\tDeploying application to plurid.app');
        } else {
            console.log('\tNot deploying to plurid.app');
        }

        const application: Application = {
            directory,
            language,
            ui,
            renderer,
            manager,
            services,
            pluridApp,
        };
        await generateApplication(application);
    } catch (error) {
        console.log('\n\tSomething went wrong.\n');
    }
}


export default processArguments;
