import Router from './Router';
import RouteMatcher from './Matcher';
import RouteParser from './Parser';

import {
    mapPathsToRoutes,
    pluridLinkPathDivider,
    resolveAbsolutePluridLinkPath,
} from './utilities';



export default Router;

export {
    RouteMatcher,
    RouteParser,

    /** utilities */
    mapPathsToRoutes,
    pluridLinkPathDivider,
    resolveAbsolutePluridLinkPath,
}

export * from './CompareTypes';

export * from './interfaces';
