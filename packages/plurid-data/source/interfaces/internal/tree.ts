export interface TreePage {
    pageID: string;
    planeID: string;
    parentPlaneID?: string;
    path: string;
    parameters?: PathParameters;
    query?: PathQuery;
    height: number;
    width: number;
    location: TreePageLocation;
    show: boolean;
    children?: TreePage[];
    bridgeLength?: number;
    planeAngle?: number;
    linkCoordinates?: LinkCoordinates;
}


export interface PathParameters {
    [key: string]: string;
}


export interface PathQuery {
    [key: string]: string;
}


export interface TreePageLocation {
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
