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
    type: string;
    manager: string;
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


export type TypeClient = 'Client-Side';
export type TypeServer = 'Server-Side';
export type Type = TypeClient | TypeServer;

export interface IType {
    client: TypeClient;
    server: TypeServer;
}


export type ManagerNPM = 'NPM';
export type ManagerYarn = 'Yarn';
export type Manager = ManagerNPM | ManagerYarn;

export interface IManager {
    npm: ManagerNPM;
    yarn: ManagerYarn;
}


export interface Application {
    directory: string;
    language: Language;
    ui: UI;
    type: Type;
    manager: Manager;
}
