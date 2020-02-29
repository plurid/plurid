import {
    RouterOptions,
    RouterPartialOptions,
    Route,
} from './interfaces';

import Matcher from '../Matcher';



export default class Router<T> {
    private routes: Route<T>[];
    private options: RouterOptions;


    constructor(
        routes: Route<T>[],
        options?: RouterPartialOptions,
    ) {
        this.routes = routes;
        this.options = this.handleOptions(options);
    }


    private handleOptions(
        options: RouterPartialOptions | undefined,
    ) {
        const routerOptions: RouterOptions = {
        };

        return routerOptions;
    }


    /**
     * Extract pathname, parameters, query, and fragment, if available.
     */
    public match(
        location: string,
    ) {
        for (const route of this.routes) {
            const matcher = new Matcher(location, route);
            const data = matcher.data();
            if (data) {
                return data;
            }
        }
    }
}
