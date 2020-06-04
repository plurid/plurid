import {
    splitPath,
    computeComparingPath,
    extractParametersValues,
} from '../Parser/logic';

import {
    ProcessedRoute,
    URLRoute,
    InternalMatchedRoute,
    RouteElements,
} from './data';



export const processRoute = (
    route: URLRoute,
): ProcessedRoute => {
    const routeElements = splitPath(route.route);
    const parameters: string[] = [];

    routeElements.map(routeElement => {
        if (routeElement[0] === ':') {
            parameters.push(routeElement);
        } else {
            parameters.push('');
        }
    });

    return {
        route: route.route,
        parametersValues: parameters,
        parameters: route.parameters,
    };
}


export const matchRoutes = (
    route: string,
    routes: Record<string, ProcessedRoute>,
): InternalMatchedRoute | undefined => {
    for (const processedRoute of Object.values(routes)) {
        const match = matchRoute(
            route,
            processedRoute,
        );

        if (!match) {
            continue;
        }

        return match;
    }

    return;
}


export const matchRoute = (
    route: string,
    processedRoute: ProcessedRoute,
): InternalMatchedRoute | undefined => {
    const {
        locationElements,
        comparingPath,
    } = computeComparingPath(
        route,
        processedRoute.parametersValues,
    );

    if (comparingPath !== processedRoute.route) {
        return;
    }

    const parametersValues = extractParametersValues(
        processedRoute.parametersValues,
        locationElements,
    );

    return {
        route: processedRoute.route,
        parameters: parametersValues,
    };
}


/**
 * Separate the route into the path, the query, and the fragment.
 *
 * @param route
 */
export const extractRouteElements = (
    route: string,
): RouteElements => {
    const splitPath = route.split('?');
    const path = splitPath[0] || '';

    const queryAndFragment = splitPath[1] || '';
    const splitQuery = queryAndFragment.split('#');
    const query = splitQuery[0] || '';
    const fragment = splitQuery[1] || '';

    return {
        path,
        query,
        fragment,
    };
}
