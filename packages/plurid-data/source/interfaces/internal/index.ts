import {
    PluridPageContext,
    Indexed,
    PluridComponentReact,
} from '../external';



export interface PluridInternalPage {
    id: string;
    path: string;
}

export interface PluridInternalStatePage extends PluridInternalPage {
    root: boolean;
    ordinal: number;
}

export interface PluridInternalContextPage extends PluridInternalPage {
    component: PluridComponentReact;
}


export interface PluridInternalDocument {
    id: string;
    name: string;
}

export interface PluridInternalStateDocument extends PluridInternalDocument {
    ordinal: number;
    pages: Indexed<PluridInternalStatePage>;
}

export interface PluridInternalContextDocument extends PluridInternalDocument {
    pages: Indexed<PluridInternalContextPage>;
}


export interface PluridContext {
    pageContext?: PluridPageContext<any>,
    pageContextValue?: any,
    documents: Indexed<PluridInternalContextDocument>;
}


export interface TreePage {
    pageID: string;
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
