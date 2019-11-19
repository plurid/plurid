import React from 'react';

import PluridPubSub from '@plurid/plurid-pubsub';



export interface PluridApp {
    /**
     * A `PluridApp` must be either pages or documents based.
     */
    pages?: PluridPage[],
    pagesContext?: PluridPagesContext<any>,

    /**
     * A `PluridApp` must be either pages or documents based.
     *
     * A `PluridDocument` is a collection of PluridPages (`PluridPage[]`).
     */
    documents?: PluridDocument[],

    configuration?: Partial<PluridConfiguration>,

    pubsub?: PluridPubSub,
}


export interface PluridPage {
    /**
     * Custom HTML, React, Vue, or Angular component to be rendered in the PluridPlane.
     */
    component: PluridComponentReact;

    /**
     * Path to the page, e.g. `/page-1`.
     *
     * The path can have parameters, e.g. `/page/:id`.
     *
     * The parameter, in the example `id`,
     * will be passed in the property `parameters` to the component,
     * e.g. `componentProperties.parameters.id`.
     */
    path: string;

    /**
     * If true, the page will be rendered on the initial layout.
     */
    root?: boolean;

    /**
     * By default, the order the pages are shown in is based on their index in the pages[].
     * The ordinal can be used to overrule the default order. Does not have to be unique.
     */
    ordinal?: number;
}

export type PluridPagesContext<T> = React.Context<T>;


export interface PluridLink {
    /**
     * The name of the document. If not specified defaults to the current one.
     */
    document?: string;

    /**
     * The path string of the page.
     */
    page: string;

    /**
     * Format the link as an achor element. Default `false`.
     */
    devisible?: boolean;

    /**
     * String character to be added inline after the PluridLink content. Default `'`.
     */
    suffix?: string;

    /**
     * Execute function at click (onClick Event).
     */
    atClick?: (event?: MouseEvent | React.MouseEvent) => void;
}


export interface PluridComponentReact {
    element: () => JSX.Element,
    properties?: PluridComponentProperties;
}


export interface PluridComponentProperties {
    [key: string]: any;
}


export interface PluridDocument {
    name: string;
    pages: PluridPage[];

    /**
     * By default, the order the documents are shown in is based on their index in the documents[].
     * The ordinal can be used to overrule the default order. Does not have to be unique.
     */
    ordinal?: number;
}


export interface PluridConfiguration {
    theme: string | PluridConfigurationTheme;

    /**
     * If true, renders the application without toolbar, viewcube, plane controls.
     */
    micro: boolean;

    toolbar: boolean;
    viewcube: boolean;
    planeControls: boolean;

    /**
     * If true, renders the page path in the controls as a domain URL.
     */
    planeDomainURL: boolean;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and cannot be negative.
     */
    planeWidth: number;

    /**
     * Value between `0.00` and `1.00` (floating numbers). Default `1.00`.
     */
    planeOpacity: number;

    space: PluridConfigurationSpace;

    // Future:
    // To change the browser URL depending on the active plane/plane in sight.
    // alterURL?: boolean;

    // To listen for the URL change and transition the camera/open plurids.
    // routeURL?: boolean;
}


export interface PluridConfigurationTheme {
    general: string;
    interaction: string;
}


export interface PluridConfigurationSpace {
    layout?: LayoutColumns | LayoutZigZag | LayoutFaceToFace | LayoutSheaves | LayoutMeta;

    /**
     * Path to the root or integer indicating the index order.
     */
    camera?: string | number;

    /**
     * Perspective value. Recommended between 1300 and 2000.
     */
    perspective?: number;

    /**
     * Make the background of the Plurid Space transparent.
     */
    transparent?: boolean;

    /**
     * If true, centers the camera on the first Plurid Root Page,
     * or, if camera is set, on the Root indicated by the camera.
     */
    center?: boolean;
}


interface Layout {
    type: 'COLUMNS' | 'FACE_TO_FACE' | 'SHEAVES' | 'ZIG_ZAG' | 'META';
}


export interface LayoutMeta extends Layout {
    type: 'META';
    layouts: LayoutMetaLayout[];
}

export interface LayoutMetaLayout {
    size?: number;
    pages?: string[];
    layout: LayoutColumns | LayoutFaceToFace | LayoutZigZag | LayoutSheaves;
}


export interface LayoutColumns extends Layout {
    type: 'COLUMNS';

    /**
     * Integer value indicating the number of columns.
     *
     * If the number of pages is greater than the number of columns, the pages will overflow onto the next row.
     */
    columns?: number;
}


export interface LayoutFaceToFace extends Layout {
    type: 'FACE_TO_FACE';

    /**
     * Value between `0.00` and `360.00` and can be negative.
     */
    halfAngle?: number;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and can be negative.
     */
    middleSpace?: number;

    /**
     * Integer value indicating the number of columns to be inserted in the middle.
     */
    middleVideos?: number;
}

export interface LayoutZigZag extends Layout {
    type: 'ZIG_ZAG';

    /**
     * Value between `0.00` and `360.00` and can be negative.
     */
    angle?: number;
}


export interface LayoutSheaves extends Layout {
    type: 'SHEAVES';

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and can be negative.
     */
    depth?: number;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and can be negative.
     */
    offsetX?: number;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current height of the screen and can be negative.
     */
    offsetY?: number;
}
