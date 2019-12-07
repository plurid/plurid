import React from 'react';



export interface PluridPage {
    /**
     * Custom HTML, React, Vue, or Angular component to be rendered in the PluridPlane.
     */
    component: PluridComponentReact;

    /**
     * Path to the page, e.g. `/page-1`. By convention, it starts with an '/'.
     *
     * If IDs not provided, the paths of all the pages within document must be unique.
     *
     * The path can have parameters, e.g. `/page/:id`.
     *
     * The parameter, in the example `id`,
     * will be passed in the property `parameters` to the component,
     * e.g. `componentProperties.parameters.id`.
     *
     * The path can be used by the `PluridLink`.
     */
    path: string;

    /**
     * Optional, application or document-wide unique identifier (if multiple documents).
     *
     * If provided to one page, all the pages must have IDs.
     *
     * Once provided, the pages can have similar paths,
     * but the `PluridLink`s must be ID-based to ensure correct linking.
     */
    id?: string;

    /**
     * If true, the page will be rendered on the initial layout.
     */
    root?: boolean;

    /**
     * By default, the order the pages are shown in is based on their index in the `pages[]`.
     * The ordinal can be used to overrule the default order.
     * If not unique, the pages with equal `ordinal` will be ordered by index.
     */
    ordinal?: number;
}



export type PluridPageContext<T> = React.Context<T>;



export interface PluridComponentReact {
    element: (properties: ReactComponentWithPluridProperties) => JSX.Element,
    properties?: PluridComponentProperties;
}

export interface ReactComponentWithPluridProperties {
    plurid: any;
    [key: string]: any;
}

export interface PluridComponentProperties {
    [key: string]: any;
}


export interface PluridComponentParameters {
    [key: string]: string;
}
