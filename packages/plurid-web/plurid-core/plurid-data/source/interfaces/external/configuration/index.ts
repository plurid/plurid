// #region imports
    // #region libraries
    import themes, {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        SIZES,
        TRANSFORM_MODES,
        TRANSFORM_TOUCHES,
        TOOLBAR_DRAWERS,
    } from '../../../enumerations';

    import {
        RecursivePartial,
    } from '../../helpers';

    import {
        PluridLayout,
    } from '../layout';

    import {
        InternationalizationLanguageType,
    } from '../../internal/internationalization';
    // #endregion external
// #endregion imports



// #region module
export type PluridPartialConfiguration = RecursivePartial<PluridConfiguration>;


export interface PluridConfiguration {
    global: PluridConfigurationGlobal;

    elements: PluridConfigurationElements;

    space: PluridConfigurationSpace;

    network: PluridConfigurationNetwork;

    development: PluridConfigurationDevelopment;
}


export interface PluridConfigurationGlobal {
    /**
     * Renders the application without any elements
     * (toolbar, viewcube, plane controls, switch, etc.).
     */
    micro: boolean;

    /**
     * A theme name based on plurid themes, https://meta.plurid.com/themes,
     * or specific theme names/objects for `general` and for the `interaction` elements.
     */
    theme: keyof typeof themes | PluridConfigurationTheme;

    /**
     * Supported languages:
     *
     * + `chinese`
     * + `english`
     * + `french`
     * + `german`
     * + `hindi`
     * + `italian`
     * + `japanese`
     * + `romanian`
     * + `russian`
     * + `spanish`
     *
     */
    language: InternationalizationLanguageType;

    /**
     * Render the elements transparent.
     *
     * Default: `false`.
     */
    transparentUI: boolean;

    /**
     * Render the view as a `plurid` space, or as a `legacy` web page.
     *
     * When setting to `legacy`, the `switch` configuration element (`elements.switch.show`)
     * should also be set to `true`, allowing the user to switch from rendering types
     * through the interface.
     *
     * Default: `plurid`.
     */
    render: 'plurid' | 'legacy';
}


export interface PluridConfigurationTheme {
    general: keyof typeof themes | Theme;
    interaction: keyof typeof themes  | Theme;
}


export interface PluridConfigurationSpace {
    layout: PluridLayout;

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

    transformLocks: PluridConfigurationSpaceTransformLocks;

    /**
     * Allow only one type of transformation, or all of them.
     */
    transformMode: keyof typeof TRANSFORM_MODES;
    /**
     * Allow multiple types of transformations.
     */
    transformMultimode: boolean;

    transformTouch: keyof typeof TRANSFORM_TOUCHES;

    firstPerson: boolean;

    cullingDistance: number;

    /**
     * Time for the planes to fade in, in milliseconds.
     *
     * Default 1500
     */
    fadeInTime: number;

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


export interface PluridConfigurationSpaceTransformLocks {
    rotationX: boolean;
    rotationY: boolean;
    translationY: boolean;
    translationX: boolean;
    translationZ: boolean;
    scale: boolean;
}


export interface PluridConfigurationElements {
    toolbar: PluridConfigurationElementsToolbar;
    viewcube: PluridConfigurationElementsViewcube;
    plane: PluridConfigurationElementsPlane;
    link: PluridConfigurationElementsLink;
    switch: PluridConfigurationElementsSwitch;
}


export interface PluridConfigurationElementsToolbar {
    show: boolean;
    opaque: boolean;
    conceal: boolean;
    transformIcons: boolean;
    transformButtons: boolean;
    drawers: (keyof typeof TOOLBAR_DRAWERS)[];
    toggledDrawers: (keyof typeof TOOLBAR_DRAWERS | undefined)[];
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
     *
     * `1` and `1.00` are based on screen width.
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


export interface PluridConfigurationElementsLink {
    suffix: string;
    preview: {
        show: boolean;
        fadeIn: number;
        fadeOut: number;
        offsetX: number;
        offsetY: number;
    };
}


export interface PluridConfigurationElementsSwitch {
    /**
     * Default: `false`.
     */
    show: boolean;
    // position: 'top left' | 'top right' | 'bottom left' | 'bottom right';
}


export interface PluridConfigurationNetwork {
    /**
     * Default `'https'`.
     */
    protocol: 'http' | 'https';

    /**
     * Defaults to the host serving the application (`window.location.host`)
     * for the browser environment, and to `'originhost'` for server environments.
     */
    host: string;
}


export interface PluridConfigurationDevelopment {
    /**
     * Show debugging information for each plane.
     */
    planeDebugger: boolean;

    /**
     * Show debugging information for the space.
     */
    spaceDebugger: boolean;
}
// #endregion module
