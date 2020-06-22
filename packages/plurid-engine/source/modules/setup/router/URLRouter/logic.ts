import {
    PluridRouteParameter,
} from '@plurid/plurid-data';

import {
    checkParameterLength,
} from '../Matcher/logic';

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
    const routeElements = splitPath(route.value);
    const parametersValues: string[] = [];

    routeElements.map(routeElement => {
        if (routeElement[0] === ':') {
            parametersValues.push(routeElement);
        } else {
            parametersValues.push('');
        }
    });

    const processedRoute: ProcessedRoute = {
        value: route.value,
        parametersValues,
        parameters: route.parameters,
    };

    return processedRoute;
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

    if (comparingPath !== processedRoute.value) {
        return;
    }

    const parametersValues = extractParametersValues(
        processedRoute.parametersValues,
        locationElements,
    );

    const validPath = checkValidPath(
        parametersValues,
        processedRoute.parameters,
    );

    if (!validPath) {
        return;
    }

    const internalMatchedRoute: InternalMatchedRoute = {
        target: processedRoute.value,
        source: route,
        parameters: parametersValues,
    };

    return internalMatchedRoute;
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

    const routeElements: RouteElements = {
        path,
        query,
        fragment,
    };

    return routeElements;
}



export const checkValidPath = (
    parameters: Record<string, string>,
    validationParameters: Record<string, PluridRouteParameter> | undefined,
) => {
    if (validationParameters) {
        for (const [parameterKey, parameterData] of Object.entries(validationParameters)) {
            const {
                length,
                lengthType,
                startsWith,
                endsWith,
                includes,
            } = parameterData;

            const paramaterValue = parameters[parameterKey];

            if (!paramaterValue) {
                return false;
            }

            if (startsWith && !paramaterValue.startsWith(startsWith)) {
                return false;
            }

            if (endsWith && !paramaterValue.endsWith(endsWith)) {
                return false;
            }

            if (includes && !includes.includes(paramaterValue)) {
                return false;
            }

            if (length) {
                const validLength = checkParameterLength(
                    paramaterValue,
                    length,
                    lengthType,
                );
                return validLength;
            }
        }
    }

    return true;
}
