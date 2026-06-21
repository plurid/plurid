// #region imports
    // #region libraries
    import {
        Theme,
        ThemeName,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        SIZES,
        TRANSFORM_MODES,
        TRANSFORM_TOUCHES,
        TOOLBAR_DRAWERS,
    } from '~enumerations/index';

    import {
        RecursivePartial,
    } from '~interfaces/helpers';

    import {
        PluridLayout,
    } from '../layout';

    import {
        InternationalizationLanguageType,
    } from '../internationalization';
    // #endregion external
// #endregion imports



// #region module
export type PluridPartialConfiguration = RecursivePartial<PluridConfiguration>;


/**
 * A FLAT shorthand for the most common `PluridConfiguration` options, so consumers don't have to
 * author the full 5-level nested object for everyday setup. Expanded + merged over the defaults by
 * the engine's `definePluridConfiguration`. Everything is optional; anything not covered here can
 * be supplied as a normal nested partial via `extend` (merged last, so it wins).
 */
export interface FlatPluridConfiguration {
    // #region global
    /** `global.theme` — a plurid theme name, or `{ general, interaction }`. */
    theme?: ThemeName | PluridConfigurationTheme;
    /** `global.micro` — render the space with NO engine elements (toolbar/viewcube/controls). */
    micro?: boolean;
    /** `global.transparentUI` — render the engine elements transparent. */
    transparentUI?: boolean;
    /** `global.language` — UI language. */
    language?: InternationalizationLanguageType;
    // #endregion global

    // #region space
    /** `space.layout` — the plane layout (e.g. `{ type: SPACE_LAYOUT.COLUMNS, columns: 3 }`). */
    layout?: PluridLayout;
    /** `space.perspective` — CSS perspective; recommended 1300–2000. */
    perspective?: number;
    /** `space.center` — center the camera on the first root. */
    center?: boolean;
    /** `space.firstPerson` — first-person ("fly") navigation. */
    firstPerson?: boolean;
    /** `space.collaboration` — opt in to the collaboration seam (publish/apply arrangement snapshots). */
    collaboration?: boolean;
    /** `space.bridge.length` — parent→child gap + rendered bridge length. */
    bridgeLength?: number;
    /** `space.bridge.planeAngle` — spawned child plane angle. */
    bridgePlaneAngle?: number;
    /** `space.transformLocks` — lock a subset of the transform axes. */
    transformLocks?: RecursivePartial<PluridConfigurationSpaceTransformLocks>;
    // #endregion space

    // #region elements
    /** `elements.plane.width` — fraction of the viewport (≤1) or absolute px (>1). */
    planeWidth?: number;
    /** `elements.plane.opacity`. */
    planeOpacity?: number;
    /** `elements.plane.controls.show` — per-plane control buttons. */
    planeControls?: boolean;
    /** `elements.toolbar.show`. */
    toolbar?: boolean;
    /** `elements.viewcube.show`. */
    viewcube?: boolean;
    /** `elements.minimap.show` — the 2D top-down overview of the space. */
    minimap?: boolean;
    // #endregion elements

    /** Escape hatch: a normal nested partial config, merged LAST (overrides the flat fields above). */
    extend?: PluridPartialConfiguration;
}


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
    theme: ThemeName | PluridConfigurationTheme;

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
    general: ThemeName | Theme;
    interaction: ThemeName | Theme;
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

    /**
     * Opt in to the collaboration seam: the engine publishes `space.collaborationMutation`
     * snapshots when the shared arrangement changes and applies `space.applyRemoteMutation` from
     * peers. Off by default — a single-user app shouldn't broadcast mutations. The host wires the
     * transport + presence.
     *
     * Default `false`.
     */
    collaboration?: boolean;

    cullingDistance: number;

    /**
     * Geometry of the bridge that joins a plurid-link-spawned child plane to its parent.
     * `length` — the bridge depth (default 100); `planeAngle` — the child plane's angle
     * off the parent in degrees (default 90).
     */
    bridge?: {
        length?: number;
        planeAngle?: number;
    };

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
    /** Optional opt-in: a 2D top-down overview/minimap of the space. */
    minimap?: PluridConfigurationElementsMinimap;
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
    toggledDrawers: (keyof typeof TOOLBAR_DRAWERS)[];
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


export interface PluridConfigurationElementsMinimap {
    show: boolean;
    /** Transparent (see-through) by default, solid only on hover. */
    transparent: boolean;
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
    /**
     * Show plane title.
     */
    title: boolean;
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
