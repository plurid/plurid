export interface TreePage {
    pageID: string;
    planeID: string;
    parentPlaneID?: string;
    path: string;
    parameters?: PathParameter;
    query?: PathQuery;
    location: TreePageLocation;
    children?: TreePage[];
    show: boolean;
}


export interface PathParameter {
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
