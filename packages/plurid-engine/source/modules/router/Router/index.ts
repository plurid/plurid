import {
    Indexed,
    PluridRouterRoute,
} from '@plurid/plurid-data';

import {
    RouterOptions,
    RouterPartialOptions,
} from './interfaces';

import {
    MatcherResponse,
} from '../Matcher/interfaces';

import Matcher from '../Matcher';



export default class Router<T> {
    private routes: PluridRouterRoute<T>[];
    private options: RouterOptions;
    private cachedMatched: Indexed<MatcherResponse<T>>;


    constructor(
        routes: PluridRouterRoute<T>[],
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
            cacheLimit: options?.cacheLimit || 1000,
        };

        return routerOptions;
    }

    /**
     * Check if the cache exceeds the cache limit and reset if true.
     */
    private checkCacheReset() {
        if (Object.entries(this.cachedMatched).length > this.options.cacheLimit) {
            this.cachedMatched = {};
        }
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
                this.checkCacheReset();
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
