export interface PluridPage {
    path: string;
    component: PluridComponent;
    location: string;
}

export interface PluridDocument {
    name: string;
    pages: PluridPage[];
}


export interface PluridComponent {
    element: JSX.Element,
    properties?: PluridComponentProperties;
}


export interface PluridComponentProperties {
    [key: string]: any;
}


export interface PluridAppConfiguration {
    alterURL: boolean;
    pluridPlane: {
        showControls: boolean;
    },
}



export interface PluridAppProperties {
    pages?: PluridPage[],
    documents?: PluridDocument[],
    configuration?: PluridAppConfiguration,
}


export interface PluridLinkProperties {
    // the name of the document, if not specified defaults to the current one
    document?: string;
    // the page path
    page: string;
}
