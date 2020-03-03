import {
    CompareType,
} from '@plurid/plurid-data';

import {
    ParserResponse,
} from '../interfaces';

import {
    compareTypes,
} from '../CompareTypes';



/**
 * If a `route` has a length specification checks the length type.
 *
 * @param pathElements
 * @param route
 */
export const checkLengths = <T>(
    parserResponse: ParserResponse<T>,
): boolean => {
    const {
        route,
        elements,
    } = parserResponse;

    if (!route.length) {
        return true;
    }

    if (
        typeof route.length === 'number'
        && (typeof route.lengthType === 'string' || typeof route.lengthType === 'undefined')
    ) {
        return checkElementLength(
            elements[0],
            route.length,
            route.lengthType,
        );
    }

    // TODO
    // handle the case where the length is an index
    // with specific lengths for specific parameters

    return false;
}


export const checkElementLength = (
    element: string,
    routeLength: number,
    compareType?: CompareType,
) => {
    const elementLength = element.length;

    switch (compareType) {
        case compareTypes.equal:
            if (elementLength === routeLength) {
                return true;
            }
            break;
        case compareTypes.equalLessThan:
            if (elementLength <= routeLength) {
                return true;
            }
            break;
        case compareTypes.lessThan:
            if (elementLength < routeLength) {
                return true;
            }
            break;
        case compareTypes.equalGreaterThan:
            if (elementLength >= routeLength) {
                return true;
            }
            break;
        case compareTypes.greaterThan:
            if (elementLength > routeLength) {
                return true;
            }
            break;
        default:
            if (elementLength === routeLength) {
                return true;
            }
    }

    return false;
}




// /**
//  * Matches the adequate `route` given the `path`, if any.
//  *
//  * @param path
//  * @param routes
//  */
// export const match = <T extends TwithPath>(
//     path: string,
//     routes: T[],
// ): MatchResponse<T> | undefined => {
//     for (const route of routes) {
//         if (route.path === '*') {
//             return {
//                 route,
//                 parameters: {},
//                 query: {},
//             };
//         }

//         const parameters = extractParameters(route.path);
//         // console.log('parameters', parameters);
//         // console.log('path', path);
//         // console.log('route.path', route.path);

//         if (parameters.length === 0) {
//             if (route.path === path) {
//                 return {
//                     route,
//                     parameters: {},
//                     query: {},
//                 };
//             }
//         }

//         if (parameters.length > 0) {
//             const {
//                 pathElements,
//                 comparingPath,
//             } = computeComparingPath(path, parameters);

//             if (comparingPath === route.path) {
//                 const parametersValues = extractParametersValues(
//                     parameters,
//                     pathElements,
//                 );

//                 const queryValues = extractQueryValues(
//                     path
//                 );

//                 return {
//                     route,
//                     parameters: parametersValues,
//                     query: queryValues,
//                 };


//                 // if (route.length) {
//                 //     const handledRoute = handleRouteLength(pathElements, route);
//                 //     if (handledRoute) {
//                 //         const parametricRoute: ActiveRoute<T> = {
//                 //             ...handledRoute,
//                 //             parameters: parametersValues,
//                 //         };
//                 //         return parametricRoute;
//                 //     }
//                 // }

//                 // if (!route.length) {
//                 //     const parametricRoute: ActiveRoute<T> = {
//                 //         ...route,
//                 //         parameters: parametersValues,
//                 //     };
//                 //     return parametricRoute;
//                 // }
//             }
//         }
//     }

//     return;
// }
