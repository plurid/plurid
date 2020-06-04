import {
    processRoute,
    matchRoute,
    matchRoutes,
    extractRouteElements,
} from './logic';

import {
    CATCH_ALL_ROUTE,

    ProcessedRoute,
    URLRoute,
    MatchedRoute,
} from './data';



class URLRouter {
    private routes: Record<string, ProcessedRoute>;

    constructor(
        routes: URLRoute[],
    ) {
        this.routes = this.processRoutes(routes);
    }

    public match(
        route: string,
    ): MatchedRoute | undefined {
        const routeElements = extractRouteElements(route);

        const {
            path,
        } = routeElements;

        /**
         * Direct match
         */
        if (this.routes[path]) {
            const matchedRoute = matchRoute(
                path,
                this.routes[path],
            );

            if (matchedRoute) {
                const {
                    value,
                    parameters,
                } = matchedRoute;

                return {
                    elements: routeElements,
                    value,
                    parameters,
                };
            }
        }

        /**
         * Parametric match
         */
        const matchedRoute = matchRoutes(
            path,
            this.routes,
        );

        if (matchedRoute) {
            const {
                value,
                parameters,
            } = matchedRoute;

            return {
                elements: routeElements,
                value,
                parameters,
            };
        }

        /**
         * Catch-all match
         */
        if (this.routes[CATCH_ALL_ROUTE]) {
            const matchedRoute = matchRoute(
                path,
                this.routes[CATCH_ALL_ROUTE],
            );

            if (matchedRoute) {
                const {
                    value,
                    parameters,
                } = matchedRoute;

                return {
                    elements: routeElements,
                    value,
                    parameters,
                };
            }
        }

        return;
    }

    private processRoutes(
        routes: URLRoute[],
    ) {
        const index: Record<string, ProcessedRoute> = {};

        for (const route of routes) {
            const processedRoute = processRoute(route);
            index[processedRoute.value] = {
                ...processedRoute,
            };
        }

        return index;
    }
}


export default URLRouter;
