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
import Parser from '../Parser';

import {
    extractQuery,
} from '../Parser/logic';

import {
    pluridLinkPathDivider,
} from '../utilities';



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
            gateway: options?.gateway,
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
        // const parsed = new Parser(location, path);
        // const query = extractQuery(location);

        // console.log('query', query);
        console.log('LOCATION', location);
        console.log('this.options.gateway', this.options.gateway);
        if (location === this.options.gateway) {
            const query = extractQuery(window.location.search);
            const pathDivisions = pluridLinkPathDivider(query.plurid);
            console.log('GATEWAY');
            console.log('query', query);
            console.log('pathDivisions', pathDivisions);
        }

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
