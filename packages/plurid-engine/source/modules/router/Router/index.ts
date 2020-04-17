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
        if (location === this.options.gateway) {
            const query = extractQuery(window.location.search);
            const pathDivisions = pluridLinkPathDivider(query.plurid);

            for (const path of this.paths) {
                if (
                    path.value === pathDivisions.path.value
                    || (path.value === '/' && pathDivisions.path.value === 'p')
                ) {
                    console.log('path', path);
                    if (path.spaces) {
                        for (const space of path.spaces) {
                            if (
                                space.value === pathDivisions.space.value
                                || (space.value === 'default' && pathDivisions.space.value === 's')
                            ) {
                                console.log('space', space);
                                if (space.universes) {
                                    for (const universe of space.universes) {
                                        if (
                                            universe.value === pathDivisions.universe.value
                                            || (universe.value === 'default' && pathDivisions.universe.value === 'u')
                                        ) {
                                            console.log('universe', universe);
                                            if (universe.clusters) {
                                                for (const cluster of universe.clusters) {
                                                    if (
                                                        cluster.value === pathDivisions.cluster.value
                                                        || (cluster.value === 'default' && pathDivisions.cluster.value === 'c')
                                                    ) {
                                                        console.log('cluster', cluster);
                                                        if (cluster.planes) {
                                                            for (const plane of cluster.planes) {
                                                                console.log('plane', plane);
                                                                if (plane.value === pathDivisions.plane.value) {
                                                                    console.log('planeaa', plane);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            console.log('GATEWAY');
            console.log('query', query);
            console.log('pathDivisions', pathDivisions);
            console.log('paths', this.paths);
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
