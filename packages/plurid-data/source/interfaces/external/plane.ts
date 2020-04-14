import React from 'react';

import {
    PluridLayout,
} from './layout';



export interface PluridPlane {
    /**
     * Custom HTML, React, Vue, or Angular component to be rendered in the PluridPlane.
     */
    component: PluridComponent;

    /**
     * Path to the plane, e.g. `/plane-1`. By convention, it starts with an '/'.
     *
     * If IDs not provided, the paths of all the plane within space must be unique.
     *
     * The path can have parameters, e.g. `/plane/:id`.
     *
     * The parameter, in the example `id`,
     * will be passed in the property `plurid.parameters` to the component,
     * e.g. `componentProperties.plurid.parameters.id`.
     *
     * The path can be used by the `PluridLink`.
     */
    path: string;

    /**
     * Optional, application or document-wide unique identifier (if multiple documents).
     *
     * If provided to one plane, all the planes must have IDs.
     *
     * Once provided, the planes can have similar paths,
     * but the `PluridLink`s should be ID-based to ensure correct linking.
     */
    id?: string;

    /**
     * Optional, application or document-wide unique identifier (if multiple documents).
     *
     * A cluster will ensure that all the planes it contains will be rendered together.
     */
    cluster?: string;
}



export type PluridPlaneContext<T> = React.Context<T>;

export interface PluridPlaneContextValue {
    [key: string]: any;
}


export type PluridComponent = PluridComponentReact;


export interface PluridComponentReact {
    /**
     * The `element` will receive the properties, if any,
     * and the `plurid` property.
     */
    element: React.FC<ReactComponentWithPluridProperty<any>>,

    /**
     * The `properties` will be passed to the `element` at runtime.
     */
    properties?: PluridComponentProperties;
}

export interface WithPluridProperty {
    plurid: PluridProperty;
}

export type ReactComponentWithPluridProperty<T> = T & WithPluridProperty;

export interface PluridComponentProperties {
    [key: string]: any;
}


export interface PluridProperty {
    parameters: PluridComponentParameters;
    query: PluridComponentQuery;
}


export interface PluridComponentParameters {
    [key: string]: string;
}


export interface PluridComponentQuery {
    [key: string]: string;
}



export interface PluridView {
    /**
     * Path to a `PluridPage`.
     *
     * The path can be URL-like, e.g. `'/page/one?query=true'`, or the page id.
     */
    path: string;

    /**
     * By default, the order the pages are shown in is based on their index in the `view[]`.
     * The ordinal can be used to overrule the default order.
     * If not unique, the pages with equal `ordinal` will be ordered by index.
     *
     * 0-based.
     */
    ordinal?: number;
}


export interface PluridCluster {
    id: string;
    name?: string;
    clusters?: PluridCluster[];
    layout?: PluridLayout;
}
