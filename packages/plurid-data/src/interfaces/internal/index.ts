import {
    PluridPage,
    PluridDocument,
} from '../';



export interface PluridLink {
    // the name of the document, if not specified defaults to the current one
    document?: string;
    // the page path
    page: string;
}


export interface PluridContext {
    pages: PluridPage[];
    documents: PluridDocument[];
}


export interface TreePageLocation {
    translateX: number;
    translateY: number;
    translateZ: number;
    rotateX: number;
    rotateY: number;
}


export interface TreePage {
    planeID: string;
    parentPlaneID?: string;
    path: string;
    location: TreePageLocation;
    children?: TreePage[];
    show: boolean;
}


export interface SpaceLocation {
    translationX: number;
    translationY: number;
    translationZ: number;
    rotationX: number;
    rotationY: number;
    scale: number;
}
