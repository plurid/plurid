// #region imports
    // #region external
    import {
        PluridRouteFragments,
    } from '../router';

    import {
        PluridPubSub,
    } from '../pubsub';
    // #endregion external
// #endregion imports



// #region module
export type ComponentWithPlurid<T, W> = T & WithPluridComponentProperty<W>;

export interface WithPluridComponentProperty<W> {
    plurid: W;
}


export type PlaneComponentWithPluridProperty<T> = ComponentWithPlurid<T, PluridPlaneComponentProperty>;

export type RouteComponentWithPluridProperty<T> = ComponentWithPlurid<T, PluridRouteComponentProperty>;


export interface PluridPlaneComponentProperty {
    route: PluridRouteComponentProperty;
    plane: PluridPlaneComponentPropertyPlane;
    pubSub: PluridPubSub;
}

export interface PluridPlaneComponentPropertyPlane {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
    fragments: PluridRouteFragments;
    planeID: string;
    parentPlaneID?: string;
}


export interface PluridRouteComponentProperty {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}
// #endregion module
