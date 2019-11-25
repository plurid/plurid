import {
    PluridPage,
    PluridPageContext,
    PluridDocument,
    Indexed,
} from '../external';



export interface PluridContext {
    pages: Indexed<PluridPage>;
    pageContext?: PluridPageContext<any>,
    pageContextValue?: any,
    documents: Indexed<PluridDocument>;
}


export interface Tree {
    [key: string]: TreePage;
}


export interface TreePage {
    planeID: string;
    parentPlaneID?: string;
    path: string;
    location: TreePageLocation;
    children?: TreePage[];
    show: boolean;
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
