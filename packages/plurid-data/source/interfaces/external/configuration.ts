import {
    SIZES,
} from '../../enumerations';

import {
    LayoutColumns,
    LayoutZigZag,
    LayoutFaceToFace,
    LayoutSheaves,
    LayoutMeta,
} from './layout';



export interface PluridConfiguration {
    /**
     * If true, renders the application without toolbar, viewcube, plane controls.
     */
    micro: boolean;

    /**
     * A theme name, `string`, based on plurid themes, https://meta.plurid.com/themes,
     * or specific theme names for `general` and `interaction` elements.
     */
    theme: string | PluridConfigurationTheme;

    elements: PluridConfigurationElements;

    space: PluridConfigurationSpace;
}


export interface PluridConfigurationTheme {
    general: string;
    interaction: string;
}


export interface PluridConfigurationSpace {
    layout: LayoutColumns | LayoutZigZag | LayoutFaceToFace | LayoutSheaves | LayoutMeta;

    /**
     * Perspective value. Recommended between 1300 and 2000.
     *
     * Default `2000`.
     */
    perspective: number;

    /**
     * Make the background of the `Plurid Space` opaque.
     *
     * Default `true`.
     */
    opaque: boolean;

    /**
     * ID of the `Plurid Root` on which to point the camera at.
     */
    camera?: string;

    /**
     * Centers the camera on the first `Plurid Root Page`,
     * or, if camera is set, on the Root indicated by the camera.
     */
    center: boolean;

    transformOrigin: PluridConfigurationSpaceTransformOrigin;


    // FUTURE:
    /**
     * Change the browser URL depending on the active plane/plane in sight.
     */
    // alterURL?: boolean;

    /**
     * Listen for the URL change and transition the camera/open plurids.
     */
    // routeURL?: boolean;
}


export interface PluridConfigurationSpaceTransformOrigin {
    show: boolean;
    size: keyof typeof SIZES;
}


export interface PluridConfigurationElements {
    toolbar: PluridConfigurationElementsToolbar;
    viewcube: PluridConfigurationElementsViewcube;
    plane: PluridConfigurationElementsPlane;
}


export interface PluridConfigurationElementsToolbar {
    opaque: boolean;
    conceal: boolean;
    transformIcons: boolean;
    transformButtons: boolean;
}


export interface PluridConfigurationElementsViewcube {
    show: boolean;
    opaque: boolean;
    conceal: boolean;

    /**
     * Show the rotation arrow buttons, and the other buttons for translation, scale, and fit view.
     */
    buttons: boolean;
}


export interface PluridConfigurationElementsPlane {
    /**
     * Value between `0.00` and `x.00` (floating numbers) or between `0` and `x00` (integers).
     *
     * The value is based on the current width of the screen and cannot be negative.
     */
    width: number;

    /**
     * Value between `0.00` and `1.00` (floating numbers).
     *
     * Default `1.00`.
     */
    opacity: number;

    controls: PluridConfigurationElementsPlaneControls;
}


export interface PluridConfigurationElementsPlaneControls {
    show: boolean;
    pathbar: PluridConfigurationElementsPlaneControlsPathbar;
}


export interface PluridConfigurationElementsPlaneControlsPathbar {
    /**
     * If true, renders the page path in the controls as a domain URL.
     */
    domainURL: boolean;

    /**
     * Executed when the pathbar from the controls has an `change` event.
     */
    onChange?: (event: any, pageID: string) => void;

    /**
     * Executed when the pathbar from the controls has an `keyDown` event.
     */
    onKeyDown?: (event: any, pageID: string) => void;
}
