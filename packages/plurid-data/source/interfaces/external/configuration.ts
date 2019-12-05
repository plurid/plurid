import {
    SIZES,
} from '../../enumerations';



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

    /**
     * Executed when the pathbar from the controls has an `onChange` event.
     */
    pathbarOnChange?: (event: any, pageID: string) => void;

    /**
     * Executed when the pathbar from the controls has an `keyDown` event.
     */
    pathbarOnKeyDown?: (event: any, pageID: string) => void;

    // Future:
    // To change the browser URL depending on the active plane/plane in sight.
    // alterURL?: boolean;

    // To listen for the URL change and transition the camera/open plurids.
    // routeURL?: boolean;

    ui: PluridConfigurationUI;
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

    showTransformOrigin?: boolean;
    transformOriginSize?: keyof typeof SIZES;
}




export interface PluridConfigurationUI {
    toolbar: PluridConfigurationUIToolbar;
    viewcube: PluridConfigurationUIViewcube;
}


export interface PluridConfigurationUIToolbar {
    hide: boolean;
    alwaysShowIcons: boolean;
    alwaysShowTransformButtons: boolean;
}


export interface PluridConfigurationUIViewcube {
    transparent: boolean;
}
