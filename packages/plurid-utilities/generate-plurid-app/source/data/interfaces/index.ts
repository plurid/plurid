// #region module
export interface Question {
    type: string;
    name: string;
    message: string;
    choices?: any[];
    default?: boolean | string;
}

/** The raw answers, from the prompts or the flags. */
export interface Answers {
    directory: string;
    manager: string;
    versioning: string;
    /** Install the dependencies after generating (default true; `--no-install` skips). */
    install: boolean;
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

/** The normalized, validated answers plus the resolved directory: what the generator runs on. */
export interface Application {
    start: number;
    directory: string;
    /** The package name: the directory's base name, lower-cased, npm-safe. */
    name: string;
    manager: Manager;
    versioning: Versioning;
    install: boolean;
}
// #endregion module
