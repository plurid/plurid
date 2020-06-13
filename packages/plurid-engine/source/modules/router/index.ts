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



export default Router;

export {
    URLRouter,
    RouteMatcher,
    RouteParser,

    /** utilities */
    mapPathsToRoutes,
    pluridLinkPathDivider,
    resolveRoute,

    extractQuery,
}

export * from './CompareTypes';

export * from './interfaces';
