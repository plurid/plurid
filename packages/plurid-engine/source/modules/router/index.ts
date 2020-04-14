import Router from './Router';
import RouteMatcher from './Matcher';
import RouteParser from './Parser';

import {
    mapPathsToRoutes,
    pluridLinkPathDivider,
} from './utilities';



export default Router;

export {
    RouteMatcher,
    RouteParser,

    /** utilities */
    mapPathsToRoutes,
    pluridLinkPathDivider,
}

export * from './CompareTypes';

export * from './interfaces';
