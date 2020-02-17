import {
    /** interfaces */
    TreePage,
} from '@plurid/plurid-data';

import {
    // Route,
    // ActiveRoute,
    RouteParameters,
    RouteQuery,
    TwithPath,
    MatchResponse,
} from './interfaces';

// import {
//     compareTypes,
// } from './compareTypes';



/**
 * Matches the adequate `route` given the `path`, if any.
 *
 * @param path
 * @param routes
 */
export const match = <T extends TwithPath>(
    path: string,
    routes: T[],
): MatchResponse<T> | undefined => {
    for (const route of routes) {
        if (route.path === '*') {
            return {
                route,
                parameters: {},
                query: {},
            };
        }

        const parameters = extractParameters(route.path);
        // console.log('parameters', parameters);
        // console.log('path', path);
        // console.log('route.path', route.path);

        if (parameters.length === 0) {
            if (route.path === path) {
                return {
                    route,
                    parameters: {},
                    query: {},
                };
            }
        }

        if (parameters.length > 0) {
            const {
                pathElements,
                comparingPath,
            } = computeComparingPath(path, parameters);

            if (comparingPath === route.path) {
                const parametersValues = extractParametersValues(
                    parameters,
                    pathElements,
                );

                const queryValues = extractQueryValues(
                    path
                );

                return {
                    route,
                    parameters: parametersValues,
                    query: queryValues,
                };


                // if (route.length) {
                //     const handledRoute = handleRouteLength(pathElements, route);
                //     if (handledRoute) {
                //         const parametricRoute: ActiveRoute<T> = {
                //             ...handledRoute,
                //             parameters: parametersValues,
                //         };
                //         return parametricRoute;
                //     }
                // }

                // if (!route.length) {
                //     const parametricRoute: ActiveRoute<T> = {
                //         ...route,
                //         parameters: parametersValues,
                //     };
                //     return parametricRoute;
                // }
            }
        }
    }

    return;
}


/**
 * Extracts the parameters names from a `route`.
 *
 * e.g.
 *
 * `'/:foo/:boo'` -> `[':foo', 'boo']`
 *
 * `'/foo/:boo'` -> `['', 'boo']`
 *
 * `'/foo/boo'` -> `[]`
 *
 * If there are no parameters returns an empty array.
 * Non-parametric route elements have an empty string as placeholder.
 *
 * @param route
 */
export const extractParameters = (
    route: string,
): string[] => {
    const pathElements = splitPath(route);
    const parameters: string[] = [];

    pathElements.forEach(pathElement => {
        if (pathElement[0] === ':') {
            parameters.push(pathElement);
        } else {
            parameters.push('');
        }
    });

    const noParameters = parameters.every(parameter => parameter === '');
    if (noParameters) {
        return [];
    }

    return parameters;
}


/**
 * Extract the parameters values.
 *
 * e.g.
 *
 * `parameters = ['', ':list']`
 *
 * `pathElements = ['list', 'foo']`
 *
 * `parametersValues = { list: 'foo' }`
 *
 * @param parameters
 * @param pathElements
 */
export const extractParametersValues = (
    parameters: string[],
    pathElements: string[],
) => {
    const parametersValues: RouteParameters = {};

    parameters.forEach(
        (parameter, index) => {
            if (parameter) {
                const parameterKey = parameter.slice(1,);
                parametersValues[parameterKey] = pathElements[index];
            }
        }
    );

    return parametersValues;
}


/**
 * Extract the query values.
 *
 * e.g.
 *
 * `path = '/foo?id=1&asd=asd'`
 *
 * `query = { id: 1, asd: 'asd' }`
 *
 * @param path
 */
export const extractQueryValues = (
    path: string,
): RouteQuery => {
    const querySplit = path.split('?');

    if (querySplit.length === 2) {
        const queryValues: RouteQuery = {};
        const query = querySplit[1];
        const queryItems = query.split('&');

        for (const item in queryItems) {
            const queryValue = item.split('=');
            const id = queryValue[0];
            const value = queryValue[1];

            queryValues[id] = value;
        }

        return queryValues;
    } else {
        return {};
    }
}


/**
 * Based on the `path` and the `parameters` computes a match for comparison.
 *
 * @param path
 * @param parameters
 */
export const computeComparingPath = (
    path: string,
    parameters: string[],
) => {
    const pathElements = splitPath(path);
    const comparingPathElements = [...pathElements];

    for (const index of pathElements.keys()) {
        if (parameters[index]) {
            comparingPathElements[index] = parameters[index];
        }
    }

    const comparingPath = '/' + comparingPathElements.join('/');

    return {
        pathElements,
        comparingPath,
    };
}


/**
 * Splits `path` into elements.
 *
 * e.g. `'/foo/boo'` -> `['foo', 'boo']`
 *
 * @param path
 */
export const splitPath = (
    path: string,
) => {
    return path.split('/').filter(i => i !== '');
}


/**
 * If a `route` has a length specification checks the length type.
 *
 * @param pathElements
 * @param route
 */
export const handleRouteLength = (
    pathElements: string[],
    route: TreePage,
): TreePage | undefined => {
    // if (!route.length) {
    //     return;
    // }

    // switch (route.lengthType) {
    //     case compareTypes.equal:
    //         if (pathElements[0].length === route.length) {
    //             return route;
    //         }
    //         break;
    //     case compareTypes.euqalLessThan:
    //         if (pathElements[0].length <= route.length) {
    //             return route;
    //         }
    //         break;
    //     case compareTypes.lessThan:
    //         if (pathElements[0].length < route.length) {
    //             return route;
    //         }
    //         break;
    //     case compareTypes.equalGreaterThan:
    //         if (pathElements[0].length >= route.length) {
    //             return route;
    //         }
    //         break;
    //     case compareTypes.greaterThan:
    //         if (pathElements[0].length > route.length) {
    //             return route;
    //         }
    //         break;
    //     default:
    //         if (pathElements[0].length === route.length) {
    //             return route;
    //         }
    // }

    return;
}
