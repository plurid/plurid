import {
    Indexed,
} from '@plurid/plurid-data';

import {
    RouterOptions,
    RouterPartialOptions,
    Route,
} from './interfaces';

import {
    MatcherResponse,
} from '../Matcher/interfaces';

import Matcher from '../Matcher';



export default class Router<T> {
    private routes: Route<T>[];
    private options: RouterOptions;
    private cachedMatched: Indexed<MatcherResponse<T>>;


    constructor(
        routes: Route<T>[],
        options?: RouterPartialOptions,
    ) {
        this.routes = routes;
        this.options = this.handleOptions(options);
        this.cachedMatched = {};
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
            const cached = this.cachedMatched[location];
            if (cached) {
                return cached;
            }

            const matcher = new Matcher(location, route);
            const data = matcher.data();
            if (data) {
                this.cachedMatched[location] = {
                    ...data,
                };

                return data;
            }
        }
    }
}
