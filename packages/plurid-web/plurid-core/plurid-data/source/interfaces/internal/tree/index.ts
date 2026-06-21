// #region imports
    // #region external
    import {
        PluridRouteFragments,
    } from '../../external/router';
    // #endregion external
// #endregion imports



// #region module
export interface TreePlane {
    /**
     * The application defined plane ID that is the source
     */
    sourceID: string;

    planeID: string;
    parentPlaneID?: string;

    /**
     * The full route string, adequately formatted
     * <protocol>://<host>://<path>://<space>://universe://cluster://<plane>
     */
    route: string;

    routeDivisions: RouteDivisions;

    linkCoordinates?: LinkCoordinates;
    height: number;
    width: number;
    location: TreePlaneLocation;
    show: boolean;
    children?: TreePlane[];
    bridgeLength?: number;
    planeAngle?: number;
    /**
     * Set when the user has dragged this plane to a manual position. The auto-layout then leaves it
     * pinned (its `location` is carried across relayouts, like measured `width`/`height`) and arranges
     * only the un-pinned planes around it. Persisted with the tree, so manual arrangement survives reload.
     */
    manuallyPositioned?: boolean;
}


/**
 * An arbitrary directed relationship between two planes, independent of the parent→child tree.
 * Links cross the tree (any plane may relate to any other), so they live in a SEPARATE adjacency
 * list on space state — not on `TreePlane`. The engine treats `kind` opaquely (a product label).
 */
export interface PlaneLink {
    id: string;
    sourcePlaneID: string;
    targetPlaneID: string;
    /** Opaque, product-defined relationship label (e.g. 'reference', 'mention'). */
    kind?: string;
    /** Where on each plane the edge attaches; defaults to the plane centre. */
    sourceAnchor?: PlaneLinkAnchor;
    targetAnchor?: PlaneLinkAnchor;
}


export type PlaneLinkAnchor =
    | 'center'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right';


export interface RouteDivisions {
    protocol: RouteHostProtocol;
    host: RouteHostDivision;
    path: RoutePathDivision;
    space: RouteSpaceDivision;
    universe: RouteUniverseDivision;
    cluster: RouteClusterDivision;
    plane: RoutePlaneDivision;
    valid: boolean;
}


export interface RouteDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface RouteHostProtocol {
    value: string;
    secure: boolean;
}


export interface RouteHostDivision {
    value: string;
    controlled: boolean;
}


export interface RoutePathDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface RouteSpaceDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface RouteUniverseDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface RouteClusterDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface RoutePlaneDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
    fragments: PluridRouteFragments;
}


export interface PathParameters {
    [key: string]: string;
}


export interface PathQuery {
    [key: string]: string;
}


export interface TreePlaneLocation {
    translateX: number;
    translateY: number;
    translateZ: number;
    rotateX: number;
    rotateY: number;
}


export interface SpaceLocation {
    translationX: number;
    translationY: number;
    translationZ: number;
    rotationX: number;
    rotationY: number;
    scale: number;
}


export interface LocationCoordinates {
    x: number;
    y: number;
    z: number;
}


export interface LinkCoordinates {
    x: number;
    y: number;
}


export interface TopPlanePoint {
    x: number;
    z: number;
}
// #endregion module
