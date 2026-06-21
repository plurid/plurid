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
    /** `space.undo` — record spatial undo/redo history. ON by default; set false to drop the middleware. */
    undo?: boolean;
    /** `space.viewpointURLWrite` — reflect the camera into the URL query param. */
    viewpointURLWrite?: boolean;
    /** `space.viewpointURLRestore` — restore the camera from the URL query param on load. */
    viewpointURLRestore?: boolean;
    /** `space.viewpointURLParam` — the viewpoint query-param name (default `v`). */
    viewpointURLParam?: string;
    /** `space.viewpointURLDebounce` — ms to coalesce URL writes during an orbit. */
    viewpointURLDebounce?: number;
    /** `space.timings` — tunable debounce windows (persist, viewpoint-change). */
    timings?: PluridConfigurationSpaceTimings;
    /** `space.gestures` — pointer-navigation sensitivities, drag threshold, momentum. */
    gestures?: PluridConfigurationSpaceGestures;
    /** `space.shortcuts` — disable / remap / extend the engine keyboard shortcuts. */
    shortcuts?: PluridConfigurationSpaceShortcuts;
    /** `space.bridge.length` — parent→child gap + rendered bridge length. */
    bridgeLength?: number;
    /** `space.bridge.planeAngle` — spawned child plane angle. */
    bridgePlaneAngle?: number;
    /** `space.transformLocks` — lock a subset of the transform axes. */
    transformLocks?: RecursivePartial<PluridConfigurationSpaceTransformLocks>;
    /** `space.opaque` — opaque space background. Default `true`. */
    opaque?: boolean;
    /** `space.camera` — ID of the root to point the camera at. */
    camera?: string;
    /** `space.transformOrigin` — show / size the transform-origin indicator. */
    transformOrigin?: RecursivePartial<PluridConfigurationSpaceTransformOrigin>;
    /** `space.transformMode` — restrict to one transform type, or all. */
    transformMode?: keyof typeof TRANSFORM_MODES;
    /** `space.transformMultimode` — allow multiple simultaneous transforms. */
    transformMultimode?: boolean;
    /** `space.transformTouch` — touch-gesture → transform mapping. */
    transformTouch?: keyof typeof TRANSFORM_TOUCHES;
    /** `space.cullingDistance` — distance beyond which planes are culled. */
    cullingDistance?: number;
    /** `space.fadeInTime` — plane fade-in duration (ms). */
    fadeInTime?: number;
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

    /**
     * Record spatial undo/redo history (the arrangement-signature middleware). ON by default. Set
     * `false` to drop the history middleware entirely — a host that owns its own undo, or one that
     * never mutates the arrangement, pays neither the per-action signature cost nor the snapshot
     * memory. When off, `space.undo` / `space.redo` (pubsub + shortcuts) are no-ops. Default `true`.
     */
    undo?: boolean;

    /**
     * Reflect the camera viewpoint into the URL query string on every change (so a view is
     * shareable / bookmarkable). OFF by default — the engine does NOT touch the URL unless asked.
     * Independent of `viewpointURLRestore`. Default `false`.
     */
    viewpointURLWrite?: boolean;

    /**
     * Restore the camera viewpoint FROM the URL query string on load (a deep-link wins over the
     * last-saved camera). OFF by default. Independent of `viewpointURLWrite`. Default `false`.
     */
    viewpointURLRestore?: boolean;

    /**
     * The query-param name the viewpoint rides on, e.g. `?v=…`. Default `'v'`.
     */
    viewpointURLParam?: string;

    /**
     * Debounce (ms) before a changed viewpoint is written to the URL — the camera changes per frame
     * during an orbit, so this coalesces the writes. Default `400`.
     */
    viewpointURLDebounce?: number;

    /**
     * Tunable debounce windows (persist, viewpoint-change). Each field defaults independently; see
     * {@link PluridConfigurationSpaceTimings}.
     */
    timings?: PluridConfigurationSpaceTimings;

    /**
     * Tune pointer-navigation feel — sensitivities, drag threshold, momentum; see
     * {@link PluridConfigurationSpaceGestures}. Read live by the gesture layer.
     */
    gestures?: PluridConfigurationSpaceGestures;

    /**
     * Disable / remap / extend the engine's keyboard shortcuts; see
     * {@link PluridConfigurationSpaceShortcuts}.
     */
    shortcuts?: PluridConfigurationSpaceShortcuts;

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


/**
 * Stable IDs for the engine's keyboard shortcuts — the keys of `shortcuts.disabled` / `shortcuts.keymap`.
 * `transformNudge` is the whole arrow-key transform group (rotate/translate/scale by step).
 */
export type PluridShortcutID =
    | 'undo'
    | 'clearSelection'
    | 'fitToView'
    | 'toggleFirstPerson'
    | 'modeRotation'
    | 'modeTranslation'
    | 'modeScale'
    | 'transformNudge'
    | 'focusPlane'
    | 'focusParent'
    | 'refreshPlane'
    | 'isolatePlane'
    | 'openClosedPlane'
    | 'closePlane'
    | 'focusPreviousRoot'
    | 'focusNextRoot'
    | 'cycleRoot'
    | 'focusRootIndex';


/**
 * Take control of the keyboard. `disabled` drops engine shortcuts (`true` = all, or specific IDs) so
 * a host can claim those keys; `keymap` remaps a shortcut's primary `event.code` (single-key
 * shortcuts only — not the `transformNudge` arrows); `onUnhandledKey` receives every keydown the
 * engine did NOT consume, so a host extends with its own bindings without fighting the engine.
 */
export interface PluridConfigurationSpaceShortcuts {
    disabled?: boolean | PluridShortcutID[];
    keymap?: Partial<Record<PluridShortcutID, string>>;
    onUnhandledKey?: (event: KeyboardEvent) => void;
}


/**
 * Tunable debounce windows (ms). The defaults coalesce per-frame churn during an orbit/zoom into a
 * single trailing write/callback; raise them to persist/notify less often, lower them for snappier
 * round-trips. Each field falls back to its default when omitted.
 */
export interface PluridConfigurationSpaceTimings {
    /** Debounce before the space snapshot is persisted after the state settles. Default `300`. */
    persistDebounce?: number;
    /** Debounce before `onViewpointChange` fires after the camera settles. Default `250`. */
    viewpointChangeDebounce?: number;
}


/**
 * Tune the feel of pointer navigation — sensitivities, the click-vs-orbit threshold, and the
 * post-orbit momentum fling. Each field defaults independently (read live, so a host can retune
 * mid-session); omit the object entirely to keep every default.
 */
export interface PluridConfigurationSpaceGestures {
    /** Orbit rotation sensitivity, degrees per pixel of drag. Default `0.22`. */
    rotateSensitivity?: number;
    /** Pan translation sensitivity, pixels per pixel of drag. Default `1`. */
    translateSensitivity?: number;
    /** Drag-to-scale sensitivity. Default `0.004`. */
    scaleSensitivity?: number;
    /** Two-pointer pinch-zoom sensitivity. Default `0.01`. */
    pinchSensitivity?: number;
    /**
     * Fly-mode look sensitivity, degrees per pixel. Governs both drag-to-look (default `0.18`) and
     * pointer-locked mouse-look (default `0.12`); set it to unify both.
     */
    flyLookSensitivity?: number;
    /** Fly-mode planar move speed, pixels per frame (WASD). Default `9`. */
    flySpeed?: number;
    /** Pixels a press must travel before it becomes an orbit (below it stays a click). Default `4`. */
    dragThreshold?: number;
    /** Per-frame momentum velocity decay, 0–1 (lower = stops sooner). Default `0.92`. */
    momentumDecay?: number;
    /** Momentum halts once |velocity| drops below this. Default `0.05`. */
    momentumMin?: number;
    /** Disable the post-orbit momentum fling entirely (release stops dead). Default `false`. */
    disableMomentum?: boolean;
}


export interface PluridConfigurationElements {
    toolbar: PluridConfigurationElementsToolbar;
    viewcube: PluridConfigurationElementsViewcube;
    /** Optional opt-in: a 2D top-down overview/minimap of the space. */
    minimap?: PluridConfigurationElementsMinimap;
    plane: PluridConfigurationElementsPlane;
    link: PluridConfigurationElementsLink;
    switch: PluridConfigurationElementsSwitch;
    /** The 3D beams drawn between plane↔plane links. Shown by default; `{ show: false }` hides them. */
    planeLinks?: PluridConfigurationElementsToggle;
    /** The live alignment guides drawn while dragging a selection. Shown by default. */
    alignmentGuides?: PluridConfigurationElementsToggle;
}


/** A minimal `{ show }` toggle for elements whose only configuration is visibility. */
export interface PluridConfigurationElementsToggle {
    show?: boolean;
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
