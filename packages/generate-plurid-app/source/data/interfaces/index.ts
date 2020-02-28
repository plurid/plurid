export interface Question {
    type: string;
    name: string;
    message: string;
    choices?: any[];
}


export interface Answers {
    directory: string;
    language: string;
    ui: string;
    renderer: string;
    manager: string;
    services: string[];
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
export type Manager = ManagerNPM | ManagerYarn;

export interface IManager {
    npm: ManagerNPM;
    yarn: ManagerYarn;
}


export type ServiceGraphQL = 'GraphQL';
export type ServiceRedux = 'Redux';
export type ServiceStripe = 'Stripe';
export type Services = ServiceGraphQL | ServiceRedux | ServiceStripe;

export interface IServices {
    graphql: ServiceGraphQL;
    redux: ServiceRedux;
    stripe: ServiceStripe;
}


export interface Application {
    directory: string;
    language: Language;
    ui: UI;
    renderer: Renderer;
    manager: Manager;
    services: string[];
}



export interface AddScriptConfiguration {
    name: string;
    value: string;
    path: string;
}
