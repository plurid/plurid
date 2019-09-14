export interface PluridApp {
    /**
     * A `PluridApp` must be either pages or documents based.
     */
    pages?: PluridPage[],

    /**
     * A `PluridApp` must be either pages or documents based.
     *
     * A `PluridDocument` is a collection of PluridPages (`PluridPage[]`).
     */
    documents?: PluridDocument[],

    configuration?: PluridConfiguration,
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
     *
     */
    root: boolean;

    /**
     * By default, the order the pages are shown in is based on their index in the pages[].
     * The ordinal can be used to overrule the default order.
     */
    ordinal?: number;
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
     * The ordinal can be used to overrule the default order.
     */
    ordinal?: number;
}


export interface PluridConfiguration {
    /**
     * If true, renders the application without toolbar, viewcube, plane controls.
     */
    micro?: boolean;

    toolbar?: boolean;
    viewcube?: boolean;

    perspective?: number;
    theme?: string | PluridConfigurationTheme;
    alterURL?: boolean;
    routeURL?: boolean;
    planes?: {
        domainURL?: boolean;
        width?: number;
        controls?: boolean;
    };
    roots?: PluridConfigurationRoots;
    [key: string]: any;
}


export interface PluridConfigurationTheme {
    general: string;
    interaction: string;
}


export interface PluridConfigurationRoots {
    layout: string[] | LayoutColumns | LayoutFaceToFace | LayoutSheaves;

    /**
     * Path to the root or integer indicating the index order.
     */
    camera: string | number;
}


export interface LayoutColumns {
    type: 'COLUMNS',

    /**
     * Integer value indicating the number of columns.
     *
     * If the number of pages is greater than the number of columns, the pages will overflow onto the next row.
     */
    columns: number;
}


export interface LayoutFaceToFace {
    type: 'FACE_TO_FACE',

    /**
     * Value between `0.00` and `360.00` and can be negative.
     */
    halfAngle: number;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and can be negative.
     */
    middleSpace: number;

    /**
     * Integer value indicating the number of columns to be inserted in the middle.
     */
    middleVideos: number;
}


export interface LayoutSheaves {
    type: 'SHEAVES',

    stalks: string[][];

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and can be negative.
     */
    depth: number;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and can be negative.
     */
    offsetX: number;

    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current height of the screen and can be negative.
     */
    offsetY: number;
}
