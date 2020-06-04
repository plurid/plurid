import {
    processRoute,
    matchRoute,
    matchRoutes,
    extractRouteElements,
} from './logic';

import {
    CATCH_ALL_ROUTE,

    ProcessedRoute,
    URLRouterRoute,
    MatchedRoute,
} from './data';



class URLRouter {
    private routes: Record<string, ProcessedRoute>;

    constructor(
        routes: URLRouterRoute[],
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
                    route,
                    parameters,
                } = matchedRoute;

                return {
                    elements: routeElements,
                    route,
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
                route,
                parameters,
            } = matchedRoute;

            return {
                elements: routeElements,
                route,
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
                    route,
                    parameters,
                } = matchedRoute;

                return {
                    elements: routeElements,
                    route,
                    parameters,
                };
            }
        }

        return;
    }

    private processRoutes(
        routes: URLRouterRoute[],
    ) {
        const index: Record<string, ProcessedRoute> = {};

        for (const route of routes) {
            const processedRoute = processRoute(route);
            index[processedRoute.route] = {
                ...processedRoute,
            };
        }

        return index;
    }
}


export default URLRouter;
