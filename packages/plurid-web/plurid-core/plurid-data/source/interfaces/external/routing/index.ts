// #region imports
    // #region external
    import {
        PluridRoute,
        PluridRoutePlane,
        PluridRoutePlaneObject,

        PluridRouteFragments,
    } from '../router';

    import {
        PluridPlane,
        PluridPlaneObject,
    } from '../plane';
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


export interface IsoMatcherResultBase {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface IsoMatcherRouteResultBase {
    match: IsoMatcherResultBase;
}

export interface IsoMatcherRouteResultRoute<C> extends IsoMatcherRouteResultBase {
    kind: 'Route';
    data: PluridRoute<C>;
}

export interface IsoMatcherRouteResultRoutePlane<C> extends IsoMatcherRouteResultBase {
    kind: 'RoutePlane';
    data: PluridRoutePlaneObject<C>;
}

export type IsoMatcherRouteResult<C> =
    | IsoMatcherRouteResultRoute<C>
    | IsoMatcherRouteResultRoutePlane<C>;



export interface IsoMatcherIndexedRoute<C> {
    data: PluridRoute<C>;
}



export type IsoMatcherPlaneType =
    | 'Plane'
    | 'RoutePlane';

export interface IsoMatcherPlaneResultMatch extends IsoMatcherResultBase {
    fragments: PluridRouteFragments;
}

export interface IsoMatcherPlaneResultBase<C> {
    parent?: string;
    match: IsoMatcherPlaneResultMatch;
}

export interface IsoMatcherPlaneResultPlane<C> extends IsoMatcherPlaneResultBase<C> {
    kind: 'Plane';
    data: PluridPlaneObject<C>;
}

export interface IsoMatcherPlaneResultRoutePlane<C> extends IsoMatcherPlaneResultBase<C> {
    kind: 'RoutePlane';
    data: PluridRoutePlaneObject<C>;
}

export type IsoMatcherPlaneResult<C> =
    | IsoMatcherPlaneResultPlane<C>
    | IsoMatcherPlaneResultRoutePlane<C>;



export type IsoMatcherResult<C> =
    | IsoMatcherRouteResult<C>
    | IsoMatcherPlaneResult<C>;



export interface IsoMatcherIndexedPlaneBase<C> {
    parent?: string;
}

export interface IsoMatcherIndexedPlanePlane<C> extends IsoMatcherIndexedPlaneBase<C> {
    kind: 'Plane';
    data: PluridPlaneObject<C>;
}

export interface IsoMatcherIndexedPlaneRoutePlane<C> extends IsoMatcherIndexedPlaneBase<C> {
    kind: 'RoutePlane';
    data: PluridRoutePlaneObject<C>;
}

export type IsoMatcherIndexedPlane<C> =
    | IsoMatcherIndexedPlanePlane<C>
    | IsoMatcherIndexedPlaneRoutePlane<C>;
// #endregion module
