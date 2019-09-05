export interface PluridPage {
    id: string;
    path: string;
    component: PluridComponent;
    location: string;
    root: boolean;
}

export interface PluridDocument {
    name: string;
    pages: PluridPage[];
}


export interface PluridComponent {
    element: () => JSX.Element,
    properties?: PluridComponentProperties;
}


export interface PluridComponentProperties {
    // if the property value starts with 'path:'
    // then the actual value must be obtained from the path of the page
    // specified after the /:, e.g. path: 'foo/:bar', properties: { bar: 'path:bar' }
    [key: string]: any;
}


export interface PluridAppConfiguration {
    perspective?: number;
    theme?: string;
    alterURL?: boolean;
    planes?: {
        width?: number;
        showControls?: boolean;
    };
    roots?: {
        layout?: string[];
        camera?: string;
    };
    [key: string]: any;
}


export interface PluridAppConfigurationLayout {
    // TODO handle a 3D layout
}


export interface PluridAppProperties {
    pages?: PluridPage[],
    documents?: PluridDocument[],
    configuration?: PluridAppConfiguration,
}


export interface PluridLinkOwnProperties {
    // the name of the document, if not specified defaults to the current one
    document?: string;
    // the page path
    page: string;
}



export interface PluridAppContext {
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
}
