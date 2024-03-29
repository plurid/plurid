// #region imports
    // #region internal
    import IsoMatcher from './IsoMatcher';
    import RouteParser from './Parser';

    import {
        extractQuery,
    } from './Parser/logic';
    // #endregion internal
// #endregion imports



// #region module
export * from './Parser/interfaces';

export * from './logic';

export {
    IsoMatcher,
    RouteParser,
    extractQuery,
};
// #endregion module
