// #region imports
    import {
        IManager,
        IVersioning,
    } from '../interfaces';
// #endregion imports



// #region module

export const managerNPM = 'NPM';
export const managerYarn = 'Yarn';
export const managerPNPM = 'pNPM';
export const manager: IManager = {
    npm: managerNPM,
    yarn: managerYarn,
    pnpm: managerPNPM,
};

export const versioningGit = 'Git';
export const versioningNone = 'None';
export const versioning: IVersioning = {
    git: versioningGit,
    none: versioningNone,
};

/** The one template: the kit's shape, TypeScript (the user's decision, 2026-09-09). */
export const TEMPLATE = 'kit-typescript';

// #endregion module
