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
        extractParametersAndMatch,
        extractQuery,
        extractFragments,
        // extractPathname,
    } from '../Parser/logic';
    // #endregion external
// #endregion imports



// #region module
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
        this.planesKeys = Array.from(this.planesIndex.keys());
    }

    private indexPlanes(
        planes: PluridPlane<C>[] | PluridRoutePlane<C>[],
        kind: IsoMatcherPlaneType,
        parent?: string,
    ) {
        for (const plane of planes) {
            const planeData = kind === 'Plane'
                ? resolvePluridPlaneData(plane as PluridPlane<C>)
                : resolvePluridRoutePlaneData(plane as PluridRoutePlane<C>);

            const address = computePlaneAddress(
                kind === 'Plane'
                    ? (planeData as any).route
                    : (planeData as any).value,
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


        for (const planePath of this.planesKeys) {
            const normalizedPlanePath = planePath.replace(protocols.plurid, '');
            const normalizedPlaneAddress = planeAddress.replace(protocols.plurid, '');

            const planePathSplit = normalizedPlanePath.split('/');
            const planeAddressSplit = normalizedPlaneAddress.split('/');

            // Not the same origin.
            if (planePathSplit[0] !== planeAddressSplit[0]) {
                continue;
            }

            // Length mismatch.
            if (planePathSplit.length !== planeAddressSplit.length) {
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
                    return;
                }

                const {
                    parameters,
                } = parametersAndMatch;

                const validPath = checkValidPath(
                    plane.data.parameters,
                    parameters,
                );
                if (!validPath) {
                    return;
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
                    return;
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
                    return;
                }

                const query = extractQuery(
                    routeValue,
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


        const routePlane = this.matchPlane(routeValue);
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
