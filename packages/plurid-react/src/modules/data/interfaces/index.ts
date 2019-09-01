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
    theme?: string;
    alterURL?: boolean;
    pluridPlane?: {
        showControls?: boolean;
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
