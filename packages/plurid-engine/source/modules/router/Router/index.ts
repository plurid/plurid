import {
    Indexed,
    PluridRouterPath,
} from '@plurid/plurid-data';

import {
    RouterOptions,
    RouterPartialOptions,
} from './interfaces';

import {
    MatcherResponse,
} from '../Matcher/interfaces';

import Matcher from '../Matcher';



export default class Router {
    private paths: PluridRouterPath[];
    private options: RouterOptions;
    private cachedMatched: Indexed<MatcherResponse>;


    constructor(
        paths: PluridRouterPath[],
        options?: RouterPartialOptions,
    ) {
        this.paths = paths;
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
        const cached = this.cachedMatched[location];
        if (cached) {
            this.checkCacheReset();
            return cached;
        }

        for (const path of this.paths) {
            const matcher = new Matcher(location, path);
            const data = matcher.data();
            if (data) {
                this.cachedMatched[location] = {
                    ...data,
                };

                return data;
            }
        }

        return;
    }
}
