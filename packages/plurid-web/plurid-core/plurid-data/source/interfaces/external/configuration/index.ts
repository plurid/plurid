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
    /** `space.dimensions` - explicit space-container size (number = px, string passthrough). */
    spaceDimensions?: PluridConfigurationSpaceDimensions;
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
    /** `space.viewpointURLVersion` — viewpoint encoding written to the URL / `onViewpointChange` (`1` default, `2` = full camera). */
    viewpointURLVersion?: 1 | 2;
    /** `space.navigation` — camera limits, orbit pivot policy, motion (tween) settings, home and presets. */
    navigation?: PluridConfigurationSpaceNavigation;
    /** `space.snap` — drag-release snapping: edges/centers within a threshold, optional grid. */
    snap?: PluridConfigurationSpaceSnap;
    /** `space.culling` — far / off-screen planes stop painting (kept mounted). */
    culling?: PluridConfigurationSpaceCulling;
    /** `elements.plane.depthFade` — planes fade (and optionally blur) with camera distance. */
    planeDepthFade?: PluridConfigurationElementsPlaneDepthFade;
    /** `elements.plane.backface` — hide planes seen from behind. */
    planeBackface?: 'visible' | 'hidden';
    /** `elements.plane.resizable` — resize handles on selected planes. */
    planeResizable?: boolean;
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
    /** @deprecated Read nowhere since the input layer v2 (2026-09); kept so existing configurations type-check. */
    transformMultimode?: boolean;
    /** @deprecated Read nowhere since the input layer v2 (2026-09; see `gestures.touchOne`); kept so existing configurations type-check. */
    transformTouch?: keyof typeof TRANSFORM_TOUCHES;
    /** @deprecated Use `culling.distance` (`space.culling`); kept as an alias for one release. */
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
     * Explicit dimensions for the space container (the roots frame). By default
     * the space fills its host horizontally (width `'100%'`) and sizes to the
     * window vertically (height `window.innerHeight`) - the historical behavior.
     * Opt in for hosts embedding the space in a sized container.
     *
     * A `number` is pixels; a `string` passes through (`'100%'`, `'60vh'`).
     *
     * Note: the layout algorithms still compute plane spacing from the measured
     * view size; `dimensions` sizes the container only.
     */
    dimensions?: PluridConfigurationSpaceDimensions;

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
     * Which viewpoint encoding the engine WRITES (to the URL and `onViewpointChange`): `1` — the
     * six-scalar `rX,rY,tX,tY,tZ,s` tuple (default, what existing share links carry); `2` — the
     * full camera (`v2|yaw|pitch|scale|pivot…|offset…|perspective`), which preserves the orbit
     * pivot and pan exactly. Both versions are always ACCEPTED on restore. Default `1`.
     */
    viewpointURLVersion?: 1 | 2;

    /**
     * Camera navigation: limits (pitch, zoom, dolly), the orbit-pivot policy, motion (tween)
     * settings, and the home / preset viewpoints; see {@link PluridConfigurationSpaceNavigation}.
     */
    navigation?: PluridConfigurationSpaceNavigation;

    /**
     * Drag-release snapping of the selection: edges and centers attract within `threshold`, else
     * an optional `grid`. The alignment guides preview exactly what the release will snap to.
     */
    snap?: PluridConfigurationSpaceSnap;

    /**
     * Culling: planes far from the eye or fully outside the (margined) view stop painting — they
     * stay mounted with their state; planes beyond `freezeDistance` keep painting but are
     * contained. Hysteresis on every threshold, so nothing flickers on a boundary. The active,
     * selected, isolated and focused planes are never culled. Off by default.
     */
    culling?: PluridConfigurationSpaceCulling;

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
        /**
         * How nested spawns turn: `alternate` (default) flips the angle's sign every generation so
         * a grandchild faces the way its grandparent does instead of ending up back-to-front;
         * `fixed` keeps turning the same way.
         */
        fan?: 'alternate' | 'fixed';
        /**
         * Which way a spawned chain grows from the plane it came from: `backward` (default) into
         * the space behind the parent — the space is explored by going deeper; `forward` toward the
         * viewer, in front of the parent's face (a chain that never sits behind the roots around
         * its parent, for a wall of roots explored by orbiting from outside).
         */
        direction?: 'backward' | 'forward';
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


export interface PluridConfigurationSpaceDimensions {
    /**
     * `number` is pixels; a `string` passes through (`'100%'`, `'60vh'`).
     */
    width?: number | string;
    /**
     * `number` is pixels; a `string` passes through (`'100%'`, `'60vh'`).
     */
    height?: number | string;
}


export interface PluridConfigurationSpaceTransformOrigin {
    show: boolean;
    size: keyof typeof SIZES;
}


/**
 * Camera navigation settings. Every field defaults independently; omit the object to keep the
 * defaults. Read live — a host can retune limits or motion mid-session through the
 * `configuration` topic.
 */
export interface PluridConfigurationSpaceNavigation {
    /** Maximum |pitch| in degrees, so the orbit never flips past vertical. Default `89`. */
    pitchLimit?: number;
    /** Minimum zoom (`scale`). Default `0.1`. */
    zoomMin?: number;
    /** Maximum zoom (`scale`). Default `4`. */
    zoomMax?: number;
    /** The pivot may dolly no closer to the eye than this fraction of the perspective distance. Default `0.6`. */
    dollyLimitFraction?: number;
    /**
     * What an orbit rotates about: the point under the cursor at gesture start (`cursor`, the
     * default — CAD-style), the center of the current selection (`selection`), or the world point at
     * the view center (`view`).
     */
    orbitPivot?: 'cursor' | 'selection' | 'view';
    /** Programmatic camera moves (frame, fit, navigate, presets). */
    motion?: PluridConfigurationSpaceNavigationMotion;
    /**
     * The home viewpoint (an encoded viewpoint string, v1 or v2). Defaults to the initial camera of
     * the space (identity: no rotation, unit zoom, pivot at the view center).
     */
    home?: string;
    /** Named preset viewpoints (encoded strings), reachable through the `space.preset` topic and the camera hooks. */
    presets?: Record<string, string>;
    /**
     * Where the camera goes when a plane that is IN VIEW closes (the plane controls, the
     * `space.closePlane` topic, `usePluridPlane().close()`): to its parent (`'parent'`, the default —
     * a child closed from within returns to where it was opened from) or nowhere (`'stay'`). Roots
     * always stay; a topic / call can override per close.
     */
    onClose?: 'parent' | 'stay';
}


export interface PluridConfigurationSpaceCulling {
    /** Default `false`. */
    enabled?: boolean;
    /** Camera-space distance from the eye beyond which a plane stops painting (a plane at the pivot depth is at `perspective`, 2000). Default `6000`. */
    distance?: number;
    /** Hysteresis fraction on the thresholds. Default `0.15`. */
    hysteresis?: number;
    /** Frustum margin as a fraction of the view size. Default `0.25`. */
    frustumMargin?: number;
    /** Distance beyond which a painted plane is contained (no measurements). Default `3500`. */
    freezeDistance?: number;
}


export interface PluridConfigurationElementsPlaneDepthFade {
    /** Default `false`. */
    enabled?: boolean;
    /** Distance at which the fade starts. Default `800`. */
    start?: number;
    /** Distance at which the fade reaches `minOpacity`. Default `2500`. */
    end?: number;
    /** Default `0.35`. */
    minOpacity?: number;
    /** Max blur in px at `end`. Default `0`. */
    blur?: number;
}


export interface PluridConfigurationSpaceSnap {
    /** Default `true`. */
    enabled?: boolean;
    /** Attraction distance in space units. Default `12`. */
    threshold?: number;
    /** Grid pitch in space units when no edge attracts; unset = no grid. */
    grid?: number;
}


export interface PluridConfigurationSpaceNavigationMotion {
    /** Tween duration in ms for programmatic camera moves. Default `380`. */
    duration?: number;
    /** Easing curve. Default `out-cubic`. */
    easing?: 'linear' | 'out-cubic' | 'out-quint' | 'in-out-cubic' | 'spring';
    /**
     * `respect` (default) collapses every camera tween, momentum fling and layout transition to an
     * instant change when the user prefers reduced motion; `ignore` keeps them.
     */
    reducedMotion?: 'respect' | 'ignore';
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
    | 'frameSelection'
    | 'home'
    | 'selectAll'
    | 'invertSelection'
    | 'duplicateSelection'
    | 'navigateLeft'
    | 'navigateRight'
    | 'navigateUp'
    | 'navigateDown'
    | 'frameActive'
    | 'grabMode'
    | 'grabHold'
    | 'exitGrabMode'
    | 'help'
    | 'toggleFirstPerson'
    | 'flyForward'
    | 'flyBack'
    | 'flyLeft'
    | 'flyRight'
    | 'flyUp'
    | 'flyDown'
    | 'flySprint'
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
export interface PluridConfigurationSpaceGesturesGamepad {
    /** Poll `navigator.getGamepads()` and drive the camera. Default `false`. */
    enabled?: boolean;
    /** Stick magnitude below which input is ignored. Default `0.15`. */
    deadZone?: number;
    /** Response curve exponent applied to the stick magnitude (1 = linear). Default `2`. */
    curve?: number;
    /** Pan / fly speed in px per 16.7 ms at full deflection. Default `14`. */
    panSpeed?: number;
    /** Orbit / look speed in degrees per 16.7 ms at full deflection. Default `2.4`. */
    orbitSpeed?: number;
    /** Zoom factor per 16.7 ms at full trigger. Default `1.02`. */
    zoomSpeed?: number;
}


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
    /** Per-gesture momentum: orbit and pan fling by default, zoom does not. */
    momentum?: {
        orbit?: boolean;
        pan?: boolean;
        zoom?: boolean;
    };
    /**
     * What a mouse wheel does: `scroll-first` (default) zooms at the cursor unless the content under
     * it can scroll along the wheel axis (then the page scrolls); `zoom` always zooms; `disabled`
     * leaves the wheel to the page. Ctrl/Cmd + wheel and pinch always zoom.
     */
    wheel?: 'zoom' | 'scroll-first' | 'disabled';
    /** Zoom factor per mouse-wheel notch. Default `1.1`. */
    wheelZoomStep?: number;
    /**
     * Zoom exponent per px of a trackpad pinch (a ctrl+wheel with trackpad-sized deltas):
     * factor = e^(−dy · sensitivity). Default `0.006`, about ×3 over a full pinch.
     */
    trackpadPinchSensitivity?: number;
    /**
     * How wheel and trackpad motion is eased: the fraction of the remaining motion applied per
     * 60 Hz frame (scaled to the real frame time), 0–1. Default `0.6` — about 90 % within 40 ms,
     * landing exactly on the total, so a burst of events neither steps nor floats; `1` applies
     * each frame's input at once. Instant under reduced motion.
     */
    wheelSmoothing?: number;
    /** What a two-finger trackpad scroll does on empty space. Default `pan`. */
    trackpadScroll?: 'pan' | 'zoom' | 'orbit' | 'disabled';
    /** What one finger does on empty space (over a plane it scrolls the content). Default `orbit`. */
    touchOne?: 'orbit' | 'pan' | 'disabled';
    /** Two-finger twist rotates the yaw. Default `false`. */
    touchTwist?: boolean;
    /** Double-click / double-tap frames the plane under the pointer (or everything). Default `true`. */
    doubleClickFrame?: boolean;
    /** Fly-mode sprint multiplier while Shift is held. Default `2.5`. */
    flySprintMultiplier?: number;
    /** Gamepad navigation (opt-in): sticks orbit/pan (fly in first person), triggers zoom/dolly, buttons frame/home/undo. */
    gamepad?: PluridConfigurationSpaceGesturesGamepad;
    /**
     * Remap what each pointer input does in the default (ALL) transform mode — so a host can make
     * left-drag orbit directly (no grab mode), claim left-drag for itself (`disabled`), or stop the
     * wheel from zooming. Only consulted when set; omit to keep the CAD defaults (left orbits only in
     * grab mode, middle / shift-drag pans, wheel zooms in grab / scale / ⌘). Does not affect the
     * explicit rotate/translate/scale modes, selection-drag, or fly mode.
     */
    buttonMap?: PluridConfigurationSpaceGesturesButtonMap;
}


export interface PluridConfigurationSpaceGesturesButtonMap {
    /** Left-button drag. Default: orbit on empty space, the page's over a plane (orbit everywhere in grab mode). */
    left?: 'orbit' | 'pan' | 'zoom' | 'dolly' | 'disabled';
    /** Middle-button drag. Default: pan. */
    middle?: 'orbit' | 'pan' | 'zoom' | 'dolly' | 'disabled';
    /** Right-button drag. Default: pan (a plain right-click still opens the menu); `menu` releases it. */
    right?: 'orbit' | 'pan' | 'zoom' | 'dolly' | 'disabled' | 'menu';
    /** Wheel / trackpad. Default: zoom at the cursor. `disabled` leaves scrolling to the page. */
    wheel?: 'zoom' | 'disabled';
    /** One finger on empty space. Default: orbit. */
    touchOne?: 'orbit' | 'pan' | 'disabled';
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

    /** Resize handles on SELECTED planes; a hand-resized plane keeps its size (`sizeMode: 'manual'`). Default `false`. */
    resizable?: boolean;

    /** Fade (and optionally blur) planes with their distance from the eye; see {@link PluridConfigurationElementsPlaneDepthFade}. */
    depthFade?: PluridConfigurationElementsPlaneDepthFade;

    /** `hidden` stops painting planes seen from behind (`backface-visibility`). Default `visible`. */
    backface?: 'visible' | 'hidden';
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

    /**
     * Development-only warnings for host mistakes (an unstable `planes` identity, a view route
     * that is not registered, a container with no height, an out-of-range perspective). Never in
     * production. Default `true`.
     */
    warnings?: boolean;
}
// #endregion module
