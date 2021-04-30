// #region imports
    // #region libraries
    import {
        PluridRoute,
        PluridRoutePlane,
        PluridPlane,
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
    plane: PluridPlane<C>;
}

export type IsoMatcherResult<C> =
    | IsoMatcherRouteResult<C>
    | IsoMatcherPlaneResult<C>;


/**
 * The `IsoMatcher` gathers all the known information about `routes` and `planes`
 * and matches client-side or server-side, in-browser or in-plurid.
 */
class IsoMatcher<C> {
    private routes: PluridRoute<C>[];
    private routePlanes: PluridRoutePlane<C>[];
    private planes: PluridPlane<C>[];

    private planesIndex: Map<string, any> = new Map();
    private routesIndex: Map<string, any> = new Map();


    constructor(
        data: IsoMatcherData<C>,
    ) {
        this.routes = data.routes || [];
        this.routePlanes = data.routePlanes || [];
        this.planes = data.planes || [];

        this.generateIndexes();
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
        console.log('this.routesIndex', this.routesIndex);
        console.log('this.planesIndex', this.planesIndex);
        switch (context) {
            case 'plane':
                return this.matchPlane(path);
            case 'route':
                return this.matchRoute(path);
        }
    }


    /**
     * Creates a common data structure able to match and route accordingly.
     */
    private generateIndexes() {
        this.indexPlanes(
            this.planes,
            'Plane',
        );

        this.indexPlanes(
            this.routePlanes,
            'RoutePlane',
        );

        for (const route of this.routes) {
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
                'some-origin',
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
        return {} as IsoMatcherPlaneResult<C>;
    }

    private matchRoute(
        path: string,
    ) {
        return {} as IsoMatcherRouteResult<C>;
    }
}
// #endregion module



// #region exports
export default IsoMatcher;
// #endregion exports
