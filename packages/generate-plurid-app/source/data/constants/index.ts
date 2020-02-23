import {
    ILanguage,
    IUI,
    IType,
    IManager,
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


export const typeClient = 'Client-Side';
export const typeServer = 'Server-Side';
export const type: IType = {
    client: typeClient,
    server: typeServer,
};


export const managerNPM = 'NPM';
export const managerYarn = 'Yarn';
export const manager: IManager = {
    npm: managerNPM,
    yarn: managerYarn,
};
