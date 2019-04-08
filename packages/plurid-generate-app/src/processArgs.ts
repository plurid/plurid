const resolveAppDirectory = (path: string) => {
    return path;
}

export const processArgs = (program: any) => {
    let app: string;
    let language: string;
    let ui: string;
    let type: string;

    if (program.app === undefined) {
        console.log('App directory (-a or --app) must be specified.');
        process.exit(1);
    }

    app = resolveAppDirectory(program.app);

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
        // case 'vue':
            ui = program.ui;
            break;
        default:
            ui = 'html';
    }

    switch(program.type) {
        case 'client':
        case 'ssr':
            type = program.type;
            break;
        default:
            type = 'client';
    }

    // console.log(program.app);
    // console.log(program.language);
    // console.log(program.ui);
    // console.log(program.type);
    // console.log('-----');
    console.log('Application will be generated at:', app);
    console.log('The application language is:', language);
    console.log('The application is based on:', ui);
    console.log('The application type is:', type);
}
