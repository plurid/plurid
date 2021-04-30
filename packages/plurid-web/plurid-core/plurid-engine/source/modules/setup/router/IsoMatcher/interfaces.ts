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
    kind: string;
    data: PluridPlaneObject<C> | PluridRoutePlaneObject<C>;
    parent?: string;
}

export type IsoMatcherResult<C> =
    | IsoMatcherRouteResult<C>
    | IsoMatcherPlaneResult<C>;

export interface IsoMatcherIndexedPlane<C> {
    kind: string;
    data: PluridPlaneObject<C> | PluridRoutePlaneObject<C>;
    parent?: string;
}
// #endregion module
