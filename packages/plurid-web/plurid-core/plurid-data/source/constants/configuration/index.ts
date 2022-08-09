// #region imports
    // #region external
    import {
        PluridConfiguration,
        PluridConfigurationGlobal,
        PluridConfigurationElements,
        PluridConfigurationSpace,
        PluridConfigurationNetwork,
        PluridConfigurationDevelopment,
    } from '../../interfaces';

    import {
        LAYOUT_TYPES,
        SIZES,
        TRANSFORM_MODES,
        TRANSFORM_TOUCHES,
    } from '../../enumerations';

    import {
        PLURID_DEFAULT_CONFIGURATION_SPACE_CULLING_DISTANCE,

        PLURID_DEFAULT_CONFIGURATION_LINK_SUFFIX,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_SHOW,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_IN,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_OUT,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_OFFSET_X,
        PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_OFFSET_Y,

        PLURID_DEFAULT_CONFIGURATION_NETWORK_HOST,
    } from '../defaults';
    // #endregion external
// #endregion imports



// #region module
export const defaultConfigurationGlobal: PluridConfigurationGlobal = {
    micro: false,
    theme: {
        general: 'plurid',
        interaction: 'plurid',
    },
    language: 'english',
    transparentUI: false,
    render: 'plurid',
};


export const defaultConfigurationElements: PluridConfigurationElements = {
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
    plane: {
        width: 1,
        opacity: 1,
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
        preview: {
            show: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_SHOW,
            fadeIn: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_IN,
            fadeOut: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_FADE_OUT,
            offsetX: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_OFFSET_X,
            offsetY: PLURID_DEFAULT_CONFIGURATION_LINK_PREVIEW_OFFSET_Y,
        },
    },
    switch: {
        show: false,
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
    transformMultimode: false,
    transformTouch: TRANSFORM_TOUCHES.PAN,
    firstPerson: false,
    cullingDistance: PLURID_DEFAULT_CONFIGURATION_SPACE_CULLING_DISTANCE,
};


export const defaultConfigurationNetwork: PluridConfigurationNetwork = {
    protocol: 'https',
    host: PLURID_DEFAULT_CONFIGURATION_NETWORK_HOST,
};


export const defaultConfigurationDevelopment: PluridConfigurationDevelopment = {
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


export const layoutNames = {
    COLUMNS: 'columns',
    ROWS: 'rows',
    FACE_TO_FACE: 'face to face',
    ZIG_ZAG: 'zig zag',
    SHEAVES: 'sheaves',
    META: 'meta',
};
// #endregion module
