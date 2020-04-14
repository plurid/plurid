export interface TreePlane {
    /**
     * The application defined plane ID that is the source
     */
    sourceID: string;

    planeID: string;
    parentPlaneID?: string;

    /**
     * The full path string, adequately formatted
     * <protocol>://<origin>://<route>://<space>://universe://cluster://<plane>
     */
    path: string;

    /**
     *
     */
    pathDivisions: PathDivisions;
    // parameters?: PathParameters;
    // query?: PathQuery;

    linkCoordinates?: LinkCoordinates;
    height: number;
    width: number;
    location: TreePlaneLocation;
    show: boolean;
    children?: TreePlane[];
    bridgeLength?: number;
    planeAngle?: number;
}


export interface PathDivisions {
    protocol: string;
    origin: PathOriginDivision;
    route: PathRouteDivision;
    space: PathSpaceDivision;
    universe: PathUniverseDivision;
    cluster: PathClusterDivision;
    plane: PathPlaneDivision;
    valid: boolean;
}


export interface PathOriginDivision {
    value: string;
    controlled: boolean;
}


export interface PathRouteDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface PathSpaceDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface PathUniverseDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface PathClusterDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
}


export interface PathPlaneDivision {
    value: string;
    parameters: Record<string, string>;
    query: Record<string, string>;
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
