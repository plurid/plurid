// #region module
export interface Question {
    type: string;
    name: string;
    message: string;
    choices?: any[];
    default?: boolean;
}


export interface Answers {
    directory: string;
    language: string;
    ui: string;
    renderer: string;
    manager: string;
    services: string[];
    versioning: string;
    containerize: boolean;
    deployment: boolean;
}


export type LanguageTypeScript = 'TypeScript';
export type LanguageJavaScript = 'JavaScript';
export type Language = LanguageTypeScript | LanguageJavaScript;

export interface ILanguage {
    typescript: LanguageTypeScript;
    javascript: LanguageJavaScript;
}


export type UIHTML = 'HTML';
export type UIReact = 'React';
export type UIVue = 'Vue';
export type UIAngular = 'Angular';
export type UI = UIHTML | UIReact | UIVue | UIAngular;

export interface IUI {
    html: UIHTML;
    react: UIReact;
    vue: UIVue;
    angular: UIAngular;
}


export type RendererClient = 'Client';
export type RendererServer = 'Server';
export type Renderer = RendererClient | RendererServer;

export interface IRenderer {
    client: RendererClient;
    server: RendererServer;
}


export type ManagerNPM = 'NPM';
export type ManagerYarn = 'Yarn';
export type ManagerPNPM = 'pNPM';
export type Manager = ManagerNPM | ManagerYarn | ManagerPNPM;

export interface IManager {
    npm: ManagerNPM;
    yarn: ManagerYarn;
    pnpm: ManagerPNPM;
}


export type VersioningGit = 'Git';
export type VersioningNone = 'None';
export type Versioning = VersioningGit | VersioningNone;

export interface IVersioning {
    git: VersioningGit;
    none: VersioningNone;
}


export type ServiceApollo = 'Apollo';
export type ServiceRedux = 'Redux';
export type ServiceStripe = 'Stripe';
export type Services =
    | ServiceApollo
    | ServiceRedux
    | ServiceStripe;

export interface IServices {
    apollo: ServiceApollo;
    redux: ServiceRedux;
    stripe: ServiceStripe;
}


export interface Application {
    start: number;
    directory: string;
    language: Language;
    ui: UI;
    renderer: Renderer;
    manager: Manager;
    services: string[];
    versioning: Versioning;
    containerize: boolean;
    deployment: boolean;
}



export interface AddScriptConfiguration {
    name: string;
    value: string;
    path: string;
}
// #endregion module
