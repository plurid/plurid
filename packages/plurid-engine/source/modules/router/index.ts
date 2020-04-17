import Router from './Router';
import RouteMatcher from './Matcher';
import RouteParser from './Parser';

import {
    mapPathsToRoutes,
    pluridLinkPathDivider,
    resolveAbsolutePluridLinkPath,
} from './utilities';

import {
    extractQuery,
} from './Parser/logic';



export default Router;

export {
    RouteMatcher,
    RouteParser,

    /** utilities */
    mapPathsToRoutes,
    pluridLinkPathDivider,
    resolveAbsolutePluridLinkPath,

    extractQuery,
}

export * from './CompareTypes';

export * from './interfaces';
