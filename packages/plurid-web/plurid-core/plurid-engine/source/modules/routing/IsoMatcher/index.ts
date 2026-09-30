// #region imports
    // #region libraries
    import {
        PluridRoute,
        PluridRoutePlane,
        PluridPlane,

        IsoMatcherContext,
        IsoMatcherData,
        IsoMatcherIndexedRoute,
        IsoMatcherIndexedPlane,
        IsoMatcherPlaneType,
        IsoMatcherPlaneResult,
        IsoMatcherPlaneResultPlane,
        IsoMatcherPlaneResultRoutePlane,
        IsoMatcherResult,
        IsoMatcherRouteResult,

        protocols,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        resolvePluridPlaneData,
        resolvePluridRoutePlaneData,
    } from '~modules/planes/logic';

    import {
        computePlaneAddress,

        checkValidPath,

        cleanPathValue,
    } from '../logic';

    import {
        decodeLocationPart,
        extractParametersAndMatch,
        extractQuery,
        extractFragments,
        splitPath,
        // extractPathname,
    } from '../Parser/logic';
    // #endregion external
// #endregion imports



// #region module
/** A plane key as the parametric match reads it, computed once per index. */
interface PlaneKeyShape {
    key: string;
    /** The key without its protocol: `host/items/:id`. */
    normalized: string;
    origin: string;
    /** The count of `/`-separated parts, empty ones included (the match compares it first). */
    length: number;
    /** The non-empty elements, a literal one as the text it reads as, a `:parameter` as it is. */
    elements: string[];
}

const shapeOfPlaneKey = (
    key: string,
): PlaneKeyShape => {
    const normalized = key.replace(protocols.plurid, '');
    const split = normalized.split('/');
    return {
        key,
        normalized,
        origin: split[0],
        length: split.length,
        elements: splitPath(normalized).map((element) => (element[0] === ':' ? element : decodeLocationPart(element))),
    };
};

/** Whether `elements` (a location's, decoded) could be a parametrization of a key's: the one test `extractParametersAndMatch` makes. */
const parametrizes = (
    keyElements: string[],
    elements: string[],
): boolean => {
    if (keyElements.length !== elements.length) {
        return false;
    }
    for (let index = 0; index < keyElements.length; index += 1) {
        const element = keyElements[index];
        if (element[0] !== ':' && element !== elements[index]) {
            return false;
        }
    }
    return true;
};


/**
 * The `IsoMatcher` gathers all the known information about `routes` and `planes`
 * and matches client-side or server-side, in-browser or in-plurid.
 */
class IsoMatcher<C> {
    private origin: string;

    private routesIndex: Map<string, IsoMatcherIndexedRoute<C>> = new Map();
    private planesIndex: Map<string, IsoMatcherIndexedPlane<C>> = new Map();

    private routesKeys: string[] = [];
    private planesKeys: string[] = [];
    /** `planesKeys` as the parametric match reads them, in the same order. */
    private planesShapes: PlaneKeyShape[] = [];


    constructor(
        data: IsoMatcherData<C>,
        origin: string = 'origin',
    ) {
        if (origin === 'origin' && typeof location !== 'undefined' && location.host) {
            this.origin = location.host;
        } else {
            this.origin = origin;
        }

        this.updateIndexes(
            data.routes || [],
            data.routePlanes || [],
            data.planes || [],
        );
        // console.log('this.routesIndex', this.routesIndex);
        // console.log('this.planesIndex', this.planesIndex);
    }


    /**
     * Matches a `path` with a known `route` or `plane`,
     * based on the strategy imposed by the `context`.
     *
     * @param path
     * @param context
     */
    public match(path: string, context: 'route'): IsoMatcherRouteResult<C> | undefined;
    public match(path: string): IsoMatcherPlaneResult<C> | undefined;
    public match(path: string, context: 'plane'): IsoMatcherPlaneResult<C> | undefined;
    public match(
        path: string,
        context: IsoMatcherContext = 'plane',
    ): IsoMatcherResult<C> | undefined {
        // anything but a string matches nothing (it used to throw inside the tree compute)
        if (typeof path !== 'string') {
            return;
        }

        switch (context) {
            case 'plane':
                return this.matchPlane(path);
            case 'route':
                return this.matchRoute(path);
        }
    }

    /**
     * Dynammically update the planes and routes indexes.
     *
     * @param data
     */
    public index(
        data: IsoMatcherData<C>,
    ) {
        this.updateIndexes(
            data.routes || [],
            data.routePlanes || [],
            data.planes || [],
        );
        // console.log('this.routesIndex index', this.routesIndex);
        // console.log('this.planesIndex index', this.planesIndex);
    }

    /**
     * Clear all data.
     *
     */
    public clear() {
        this.routesIndex = new Map();
        this.planesIndex = new Map();
        this.routesKeys = [];
        this.planesKeys = [];
        this.planesShapes = [];
    }

    /**
     * Drop the plane indexed at `route` — the route as it was indexed (`/items/:id`, not a path it
     * answers to). `false` when no plane was indexed there.
     */
    public remove(
        route: string,
        parent?: string,
    ): boolean {
        if (typeof route !== 'string') {
            return false;
        }
        const removed = this.planesIndex.delete(
            computePlaneAddress(route, parent, this.origin),
        );
        if (removed) {
            this.updatePlanesKeys();
        }
        return removed;
    }

    public getPlanesIndex() {
        return this.planesIndex;
    }


    /**
     * Creates a common data structure able to match and route accordingly.
     *
     */
    private updateIndexes(
        routes: PluridRoute<C>[],
        routePlanes: PluridRoutePlane<C>[],
        planes: PluridPlane<C>[],
    ) {
        this.indexPlanes(
            planes,
            'Plane',
        );

        this.indexPlanes(
            routePlanes,
            'RoutePlane',
        );

        for (const route of routes) {
            if (route.planes) {
                this.indexPlanes(
                    route.planes,
                    'RoutePlane',
                    route.value,
                );
            }

            this.routesIndex.set(
                route.value,
                {
                    data: {
                        ...route,
                    },
                },
            );
        }

        this.routesKeys = Array.from(this.routesIndex.keys());
        this.updatePlanesKeys();
    }

    private updatePlanesKeys() {
        this.planesKeys = Array.from(this.planesIndex.keys());
        this.planesShapes = this.planesKeys.map(shapeOfPlaneKey);
    }

    private indexPlanes(
        planes: PluridPlane<C>[] | PluridRoutePlane<C>[],
        kind: IsoMatcherPlaneType,
        parent?: string,
    ) {
        for (const plane of planes) {
            if (!plane) {
                continue;
            }

            const planeData = kind === 'Plane'
                ? resolvePluridPlaneData(plane as PluridPlane<C>)
                : resolvePluridRoutePlaneData(plane as PluridRoutePlane<C>);

            const planeRoute: unknown = kind === 'Plane'
                ? (planeData as any).route
                : (planeData as any).value;
            // a plane without a route has no address: it is not indexed (it threw here)
            if (typeof planeRoute !== 'string') {
                continue;
            }

            const address = computePlaneAddress(
                planeRoute,
                parent,
                this.origin,
            );

            const indexedPlane: any /** IsoMatcherIndexedPlane<C> */ = {
                kind,
                data: {
                    ...planeData,
                },
            };
            if (parent) {
                indexedPlane['parent'] = parent;
            }

            this.planesIndex.set(
                address,
                indexedPlane,
            );
        }
    }


    private matchPlane(
        value: string,
    ) {
        const planeAddress = computePlaneAddress(
            value,
            undefined,
            this.origin,
        );

        const plane = this.planesIndex.get(planeAddress);

        if (plane) {
            const query = extractQuery(
                value,
            );
            const fragments = extractFragments(
                value,
            );

            const match = {
                value: planeAddress,
                fragments,
                query,
                parameters: {},
            };

            if (plane.kind === 'Plane') {
                const {
                    kind,
                    data,
                    parent,
                } = plane;

                const result: IsoMatcherPlaneResultPlane<C> = {
                    kind,
                    data,
                    parent,
                    match,
                };
                return result;
            }

            if (plane.kind === 'RoutePlane') {
                const {
                    kind,
                    data,
                    parent,
                } = plane;

                const result: IsoMatcherPlaneResultRoutePlane<C> = {
                    kind,
                    data,
                    parent,
                    match,
                };
                return result;
            }
        }


        // The address is read ONCE, and every key by the shape it was indexed with: the loop used to
        // re-split both sides for every key, so a match against many parametric planes cost a
        // split, a replace and a full parameter extraction per key (1000 view items over 1000
        // parametric planes: 0.9 s). A key whose literal elements differ is skipped at once.
        const normalizedPlaneAddress = planeAddress.replace(protocols.plurid, '');
        const planeAddressSplit = normalizedPlaneAddress.split('/');
        const planeAddressElements = splitPath(normalizedPlaneAddress).map(decodeLocationPart);

        for (const shape of this.planesShapes) {
            const planePath = shape.key;
            const normalizedPlanePath = shape.normalized;

            // Not the same origin.
            if (shape.origin !== planeAddressSplit[0]) {
                continue;
            }

            // Length mismatch.
            if (shape.length !== planeAddressSplit.length) {
                continue;
            }

            // Not a parametrization of the key: a literal element reads as another text.
            if (!parametrizes(shape.elements, planeAddressElements)) {
                continue;
            }

            // Check if the plane `address` is a parametrization of `planePath`.
            const parametersAndMatch = extractParametersAndMatch(
                normalizedPlaneAddress,
                normalizedPlanePath,
            );

            // console.log('normalizedPlaneAddress', normalizedPlaneAddress);
            // console.log('normalizedPlanePath', normalizedPlanePath);
            // console.log('parametersAndMatch', parametersAndMatch);
            if (parametersAndMatch.match) {
                const plane = this.planesIndex.get(planePath);
                if (!plane) {
                    // Try the next candidate, don't abandon the whole match — a later route
                    // in `planesKeys` may still match.
                    continue;
                }

                const {
                    parameters,
                } = parametersAndMatch;

                const validPath = checkValidPath(
                    plane.data.parameters,
                    parameters,
                );
                if (!validPath) {
                    continue;
                }

                const query = extractQuery(
                    value,
                );
                const fragments = extractFragments(
                    value,
                );

                const match = {
                    value: planeAddress,
                    fragments,
                    query,
                    parameters,
                };

                if (plane.kind === 'Plane') {
                    const {
                        kind,
                        data,
                        parent,
                    } = plane;

                    const result: IsoMatcherPlaneResultPlane<C> = {
                        kind,
                        data,
                        parent,
                        match,
                    };

                    return result;
                }

                if (plane.kind === 'RoutePlane') {
                    const {
                        kind,
                        data,
                        parent,
                    } = plane;

                    const result: IsoMatcherPlaneResultRoutePlane<C> = {
                        kind,
                        data,
                        parent,
                        match,
                    };

                    return result;
                }
            }
        }


        return;
    }

    private matchRoute(
        value: string,
    ) {
        const routeValue = cleanPathValue(value);
        const route = this.routesIndex.get(routeValue);

        if (route) {
            const query = extractQuery(
                value,
            );

            const result: IsoMatcherRouteResult<C> = {
                kind: 'Route',
                data: route.data,
                match: {
                    // value: extractPathname(value),
                    value: routeValue,
                    query,
                    parameters: {},
                },
            };

            return result;
        }


        for (const routePath of this.routesKeys) {
            // Check if the `value` is a parametrization of `routePath`.
            const routeSplit = routePath.split('/');
            const valueSplit = routeValue.split('/');

            // Length mismatch.
            if (routeSplit.length !== valueSplit.length) {
                continue;
            }

            const parametersAndMatch = extractParametersAndMatch(
                routeValue.slice(1),
                routePath.slice(1),
            );

            // console.log('value', value);
            // console.log('routePath', routePath);
            // console.log('parametersAndMatch', parametersAndMatch);
            if (parametersAndMatch.match) {
                const route = this.routesIndex.get(routePath);
                // console.log('route', route);
                if (!route) {
                    // Try the next candidate route rather than abandoning the whole match.
                    continue;
                }

                const {
                    parameters,
                } = parametersAndMatch;

                const validPath = checkValidPath(
                    route.data.parameters,
                    parameters,
                );
                // console.log('validPath', validPath);
                if (!validPath) {
                    continue;
                }

                // Extract the query from the ORIGINAL `value`, not `routeValue` —
                // `cleanPathValue` already stripped the query off `routeValue` (which is why
                // params resolve), so `extractQuery(routeValue)` always returned `{}`. The
                // exact-match branch above already uses `value` correctly.
                const query = extractQuery(
                    value,
                );

                const match = {
                    // value: extractPathname(value),
                    value: routeValue,
                    query,
                    parameters,
                };

                if (route) {
                    const result: IsoMatcherRouteResult<C> = {
                        kind: 'Route',
                        data: route.data,
                        match,
                    };
                    // console.log('route result', result);

                    return result;
                }
            }
        }


        // the raw value: the plane match reads the query and the fragment off it (its address is the pathname's)
        const routePlane = this.matchPlane(value);
        // console.log('routePlane', value, this.planesIndex, routePlane);

        if (routePlane) {
            const result: IsoMatcherRouteResult<C> = {
                kind: 'RoutePlane',
                data: routePlane.data as any, // HACK
                match: {
                    // value: extractPathname(value),
                    value: routeValue,
                    query: routePlane.match.query,
                    parameters: routePlane.match.parameters,
                },
            };

            return result;
        }


        return;
    }
}
// #endregion module



// #region exports
export default IsoMatcher;
// #endregion exports
