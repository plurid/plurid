import {
    ILanguage,
    IUI,
    IRenderer,
    IManager,
    IAddons,
} from '../interfaces';



export const languageTypeScript = 'TypeScript';
export const languageJavaScript = 'JavaScript';
export const language: ILanguage = {
    typescript: languageTypeScript,
    javascript: languageJavaScript,
};


export const uiHTML = 'HTML';
export const uiReact = 'React';
export const uiVue = 'Vue';
export const uiAngular = 'Angular';
export const ui: IUI = {
    html: uiHTML,
    react: uiReact,
    vue: uiVue,
    angular: uiAngular,
};


export const rendererClient = 'Client';
export const rendererServer = 'Server';
export const renderer: IRenderer = {
    client: rendererClient,
    server: rendererServer,
};


export const managerNPM = 'NPM';
export const managerYarn = 'Yarn';
export const manager: IManager = {
    npm: managerNPM,
    yarn: managerYarn,
};


export const addonsGraphQL = 'GraphQL';
export const addonsRedux = 'Redux';
export const addons: IAddons = {
    graphql: addonsGraphQL,
    redux: addonsRedux,
};
