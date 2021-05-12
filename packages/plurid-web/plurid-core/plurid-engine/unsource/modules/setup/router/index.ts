// #region imports
    // #region internal
    import IsoMatcher from './IsoMatcher';
    import Router from './Router';
    import URLRouter from './URLRouter';
    import RouteMatcher from './Matcher';
    import RouteParser from './Parser';

    import {
        mapPathsToRoutes,
        pluridLinkPathDivider,
        resolveRoute,
    } from './utilities';

    import {
        extractQuery,
    } from './Parser/logic';
    // #endregion internal
// #endregion imports



// #region module
export default Router;

export {
    IsoMatcher,

    URLRouter,
    RouteMatcher,
    RouteParser,

    /** utilities */
    mapPathsToRoutes,
    pluridLinkPathDivider,
    resolveRoute,

    extractQuery,
};

export * from './interfaces';

export * from './general';
// #endregion module