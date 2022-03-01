// #region imports
    // #region external
    import {
        ILanguage,
        IUI,
        IRenderer,
        IManager,
        IServices,
        IVersioning,
    } from '../interfaces';
    // #endregion external
// #endregion imports



// #region module
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


export const serviceApollo = 'Apollo';
export const serviceRedux = 'Redux';
export const serviceStripe = 'Stripe';
export const services: IServices = {
    apollo: serviceApollo,
    redux: serviceRedux,
    stripe: serviceStripe,
};



export const versioningGit = 'Git';
export const versioningNone = 'None';
export const versioning: IVersioning = {
    git: versioningGit,
    none: versioningNone,
};
// #endregion module
