import {
    MatcherOptions,
    MatcherPartialOptions,
} from './interfaces';

import {
    Route,
} from '../Router/interfaces';

import Parser from '../Parser';



export default class Matcher<T> {
    private location: string;
    private route: Route<T>;
    private options: MatcherOptions;
    private matchedData: undefined | Route<T>;


    constructor(
        location: string,
        route: Route<T>,
        options?: MatcherPartialOptions,
    ) {
        this.location = location;
        this.route = route;
        this.options = this.handleOptions(options);

        this.checkLocation();
    }


    private handleOptions(
        options: MatcherPartialOptions | undefined,
    ) {
        const matcherOptions: MatcherOptions = {
        };
        return matcherOptions;
    }

    private checkLocation() {
        const parsedLocation = new Parser(this.location, this.route);
        const parserResponse = parsedLocation.extract();

        // this.matchedData = locationData;
    }


    /**
     * Extract pathname, parameters, query, and fragment, if available.
     */
    public data() {
        return this.matchedData;
    }
}













// import {
//     /** interfaces */
//     TreePage,
// } from '@plurid/plurid-data';

// import {
//     // Route,
//     // ActiveRoute,
//     RouteParameters,
//     RouteQuery,
//     TwithPath,
//     MatchResponse,
// } from './interfaces';

// // import {
// //     compareTypes,
// // } from './compareTypes';



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





// /**
//  * If a `route` has a length specification checks the length type.
//  *
//  * @param pathElements
//  * @param route
//  */
// export const handleRouteLength = (
//     pathElements: string[],
//     route: TreePage,
// ): TreePage | undefined => {
//     // if (!route.length) {
//     //     return;
//     // }

//     // switch (route.lengthType) {
//     //     case compareTypes.equal:
//     //         if (pathElements[0].length === route.length) {
//     //             return route;
//     //         }
//     //         break;
//     //     case compareTypes.euqalLessThan:
//     //         if (pathElements[0].length <= route.length) {
//     //             return route;
//     //         }
//     //         break;
//     //     case compareTypes.lessThan:
//     //         if (pathElements[0].length < route.length) {
//     //             return route;
//     //         }
//     //         break;
//     //     case compareTypes.equalGreaterThan:
//     //         if (pathElements[0].length >= route.length) {
//     //             return route;
//     //         }
//     //         break;
//     //     case compareTypes.greaterThan:
//     //         if (pathElements[0].length > route.length) {
//     //             return route;
//     //         }
//     //         break;
//     //     default:
//     //         if (pathElements[0].length === route.length) {
//     //             return route;
//     //         }
//     // }

//     return;
// }




// /**
//  * Extract path, query, fragments from a link.
//  *
//  * e.g., from `'/one?id=1#:~:text=Foo,Boo'` it extracts
//  *
//  * @example
//  *  {
//  *      path: '/one',
//  *      query: {
//  *          id: 1,
//  *      },
//  *      fragments: {
//  *          text: {
//  *              start: 'Foo',
//  *              end: 'Boo',
//  *              occurence: 0,
//  *          },
//  *      },
//  *  }
//  *
//  * @param link
//  */
// export const linkParser = (
//     link: string,
// ): ParsedLink => {
//     const split = link.split('#:~:');
//     const pathWithQuery = split[0];
//     const fragmentsValues = split[1];

//     const path = pathWithQuery.split('?')[0];
//     const query = extractQueryValues(pathWithQuery);
//     const fragments = extractFragments(fragmentsValues);

//     return {
//         path,
//         query,
//         fragments,
//     };
// }
