export interface PluridPage {
    path: string;
    component: PluridComponent;
    location: string;
}

export interface PluridDocument {
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
