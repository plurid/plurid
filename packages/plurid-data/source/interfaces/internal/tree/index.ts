import {
    RouterFragments,
} from '../../external/router';



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
}


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
    fragments: RouterFragments;
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
