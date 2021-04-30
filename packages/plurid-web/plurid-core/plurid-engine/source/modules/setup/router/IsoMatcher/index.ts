// #region imports
    // #region libraries
    import {
        PluridRoute,
        PluridRoutePlane,
        PluridRoutePlaneObject,
        PluridPlane,
        PluridPlaneObject,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        resolvePluridPlaneData,
        resolvePluridRoutePlaneData,
    } from '../../general/planes';

    import {
        computePlaneAddress,
    } from '../general';
    // #endregion external
// #endregion imports



// #region module
export interface IsoMatcherData<C> {
    routes?: PluridRoute<C>[];
    routePlanes?: PluridRoutePlane<C>[];
    planes?: PluridPlane<C>[];
}

export type IsoMatcherContext =
    | 'route'
    | 'plane';

export interface IsoMatcherRouteResult<C> {
    route: PluridRoute<C>;
}

export interface IsoMatcherPlaneResult<C> {
    kind: any;
    data: PluridPlaneObject<C> | PluridRoutePlaneObject<C>;
}

export type IsoMatcherResult<C> =
    | IsoMatcherRouteResult<C>
    | IsoMatcherPlaneResult<C>;


/**
 * The `IsoMatcher` gathers all the known information about `routes` and `planes`
 * and matches client-side or server-side, in-browser or in-plurid.
 */
class IsoMatcher<C> {
    private origin: string;

    private planesIndex: Map<string, any> = new Map();
    private routesIndex: Map<string, any> = new Map();


    constructor(
        data: IsoMatcherData<C>,
        origin: string = 'origin',
    ) {
        this.origin = origin;

        this.updateIndexes(
            data.routes || [],
            data.routePlanes || [],
            data.planes || [],
        );
    }


    /**
     * Matches a `path` with a known `route` or `plane`,
     * based on the strategy imposed by the `context`.
     *
     * @param path
     * @param context
     */
    public match(path: string, context: 'route'): IsoMatcherRouteResult<C>;
    public match(path: string): IsoMatcherPlaneResult<C>;
    public match(path: string, context: 'plane'): IsoMatcherPlaneResult<C>;
    public match(
        path: string,
        context: IsoMatcherContext = 'plane',
    ): IsoMatcherResult<C> {
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
    }

    /**
     * Clear all data.
     */
    public clear() {
        this.planesIndex = new Map();
        this.routesIndex = new Map();
    }


    /**
     * Creates a common data structure able to match and route accordingly.
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
                route,
            );
        }
    }

    private indexPlanes(
        planes: PluridPlane<C>[] | PluridRoutePlane<C>[],
        kind: 'Plane' | 'RoutePlane',
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

            const indexedPlane = {
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
        path: string,
    ) {
        const address = computePlaneAddress(
            path,
            undefined,
            this.origin,
        );

        const plane = this.planesIndex.get(address);
        return plane;

        // return {} as IsoMatcherPlaneResult<C>;
    }

    private matchRoute(
        path: string,
    ) {
        const route = this.routesIndex.get(path);
        return {
            route,
        };

        // return {} as IsoMatcherRouteResult<C>;
    }
}
// #endregion module



// #region exports
export default IsoMatcher;
// #endregion exports
