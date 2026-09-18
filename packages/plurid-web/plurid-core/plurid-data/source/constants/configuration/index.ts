// #region imports
    // #region external
    import {
        PluridConfiguration,
        PluridConfigurationGlobal,
        PluridConfigurationElements,
        PluridConfigurationSpace,
        PluridConfigurationNetwork,
        PluridConfigurationDevelopment,
        PluridPartialConfiguration,
    } from '../../interfaces';

    import {
        LAYOUT_TYPES,
        SIZES,
        TRANSFORM_MODES,
    } from '../../enumerations';

    import {

        PLURID_DEFAULT_CONFIGURATION_LINK_SUFFIX,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_SHOW,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_IN,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_OUT,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_OFFSET_X,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_OFFSET_Y,

        PLURID_DEFAULT_CONFIGURATION_NETWORK_HOST,
    } from '../defaults';

    import {
        BRIDGE_BAND_RUN,
        BRIDGE_TIP_HEIGHT,
        BRIDGE_LEAN_KNEE,
        BRIDGE_LEAN_LIMIT,
    } from '../space';
    // #endregion external
// #endregion imports



// #region module
export const defaultConfigurationGlobal: PluridConfigurationGlobal = {
    look: 'graphite',
    theme: {
        general: 'plurid',
        interaction: 'plurid',
    },
    language: 'english',
    transparentUI: false,
};


export const defaultConfigurationElements: PluridConfigurationElements = {
    chrome: 'full',
    planeBridge: {
        show: true,
    },
    shortcuts: {
        show: true,
    },
    palette: {
        show: true,
    },
    marquee: {
        show: true,
    },
    toolbar: {
        show: true,
        opaque: true,
        conceal: false,
        transformIcons: false,
        transformButtons: false,
        drawers: [],
        toggledDrawers: [],
    },
    viewcube: {
        show: true,
        opaque: true,
        conceal: false,
        buttons: true,
    },
    minimap: {
        show: false,
        transparent: true,
    },
    dockRail: {
        show: true,
    },
    plane: {
        width: 1,
        opacity: 1,
        // a plane seen from behind does not paint: with an alternating fan nothing reaches 180°
        backface: 'hidden',
        controls: {
            show: true,
            title: true,
            pathbar: {
                domainURL: true,
            },
        },
    },
    link: {
        suffix: PLURID_DEFAULT_CONFIGURATION_LINK_SUFFIX,
        // a press on a link is the space's: no browser link-drag out of a plane
        draggable: false,
        preview: {
            show: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_SHOW,
            fadeIn: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_IN,
            fadeOut: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_OUT,
            offsetX: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_OFFSET_X,
            offsetY: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_OFFSET_Y,
        },
    },
};


export const defaultConfigurationSpace: PluridConfigurationSpace = {
    layout: {
        type: LAYOUT_TYPES.COLUMNS,
        columns: 2,
    },
    perspective: 2000,
    opaque: true,
    fadeInTime: 1500,
    center: false,
    presentation: 'space',
    docking: {
        motion: 'swing',
        chrome: 'hidden',
        reveal: {
            scale: 0.75,
            pitch: -24,
            yaw: 0,
        },
        fade: 240,
        aside: 'lineage',
        focus: true,
        epsilon: 0.5,
        // `fill`, deliberately: under `natural` a plane centred at scale 1 IS its dock pose, so a
        // fresh space with a centred root reads as docked, hides its chrome and turns the rail
        // the wrong way (measured 2026-09-16: 24 scenarios red). The option stays for a host
        // whose planes are never centred at 1.
        scale: 'fill',
    },
    transformOrigin: {
        show: true,
        size: SIZES.NORMAL,
    },
    transformLocks: {
        rotationX: true,
        rotationY: true,
        translationY: true,
        translationX: true,
        translationZ: true,
        scale: true,
    },
    transformMode: TRANSFORM_MODES.ALL,
    firstPerson: false,
    collaboration: false,
    undo: true,
    viewpointURLWrite: false,
    viewpointURLRestore: false,
    viewpointURLParam: 'v',
    viewpointURLDebounce: 400,
    viewpointURLVersion: 1,
    navigation: {
        pitchLimit: 89,
        zoomMin: 0.1,
        zoomMax: 4,
        dollyLimitFraction: 0.6,
        orbitPivot: 'cursor',
        onClose: 'parent',
        childFraming: 'pair',
        framing: {
            fill: 0.85,
        },
        fitYaw: 'best',
        motion: {
            duration: 380,
            easing: 'out-cubic',
            reducedMotion: 'respect',
        },
    },
    snap: {
        enabled: true,
        threshold: 12,
    },
    culling: {
        enabled: false,
        distance: 6000,
        hysteresis: 0.15,
        frustumMargin: 0.25,
        freezeDistance: 3500,
    },
    timings: {
        persistDebounce: 300,
        viewpointChangeDebounce: 250,
    },
    bridge: {
        length: 100,
        // 90.1 AND NEVER 90: an exactly perpendicular plane is a zero-width quad that CSS 3D
        // mishandles (the user's rule, 2026-09-16). The camera does the reading work: every act
        // that shows a branch frames parent and child from the yaw between them.
        planeAngle: 90.1,
        fan: 'alternate',
        direction: 'backward',
        keepBehind: false,
        anchor: 'edge',
        preset: 'reading',
        taper: {
            run: BRIDGE_BAND_RUN,
            tip: BRIDGE_TIP_HEIGHT,
        },
        lean: {
            knee: BRIDGE_LEAN_KNEE,
            limit: BRIDGE_LEAN_LIMIT,
        },
    },
};


/**
 * THE BRIDGE PRESETS: a name for a set of the bridge fields, applied under any given explicitly.
 * `reading` is the default (and equals the defaults above); `objects` is the geometry every
 * release before 2026-09 had.
 */
export const bridgePresets = {
    reading: {
        planeAngle: 90.1,
        fan: 'alternate' as const,
        anchor: 'edge' as const,
        keepBehind: false,
    },
    objects: {
        planeAngle: 90,
        fan: 'fixed' as const,
        anchor: 'link' as const,
        keepBehind: false,
    },
};


export const defaultConfigurationNetwork: PluridConfigurationNetwork = {
    protocol: 'https',
    host: PLURID_DEFAULT_CONFIGURATION_NETWORK_HOST,
};


export const defaultConfigurationDevelopment: PluridConfigurationDevelopment = {
    warnings: true,
    inspector: false,
    planeDebugger: false,
    spaceDebugger: false,
};


export const defaultConfiguration: PluridConfiguration = {
    global: {
        ...defaultConfigurationGlobal,
    },
    elements: {
        ...defaultConfigurationElements,
    },
    space: {
        ...defaultConfigurationSpace,
    },
    network: {
        ...defaultConfigurationNetwork,
    },
    development: {
        ...defaultConfigurationDevelopment,
    },
};


/**
 * What `space.presentation: 'page'` changes about the defaults: no fade-in (the first paint IS the
 * page), no space gradient (the page floats on the host's own backdrop when revealed), every plane
 * sized to the view (its content scrolls inside). Layered under a host's own values by `merge`.
 */
export const pagePresentationDefaults: PluridPartialConfiguration = {
    space: {
        fadeInTime: 0,
        opaque: false,
        // a site is URLs: the docked page's path in the address bar (the fourth page default)
        docking: {
            url: true,
        },
    },
    elements: {
        plane: {
            height: 1,
        },
    },
};


export const layoutNames = {
    COLUMNS: 'columns',
    ROWS: 'rows',
    FACE_TO_FACE: 'face to face',
    ZIG_ZAG: 'zig zag',
    SHEAVES: 'sheaves',
    META: 'meta',
};
// #endregion module
