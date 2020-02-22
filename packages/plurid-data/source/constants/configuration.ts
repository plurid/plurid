import {
    PluridConfiguration,
} from '../interfaces';

import {
    LAYOUT_TYPES,
    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,
} from '../enumerations';

import {
    PLURID_DEFAULT_CONFIGURATION_SPACE_CULLING_DISTANCE,
} from './defaults';



export const defaultConfiguration: PluridConfiguration = {
    micro: false,
    theme: {
        general: 'plurid',
        interaction: 'plurid',
    },
    transparentUI: false,
    elements: {
        toolbar: {
            show: true,
            opaque: true,
            conceal: false,
            transformIcons: false,
            transformButtons: false,
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
                pathbar: {
                    domainURL: true,
                },
            },
        },
    },
    space: {
        layout: {
            type: LAYOUT_TYPES.COLUMNS,
            columns: 2,
        },
        perspective: 2000,
        opaque: true,
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
    },
};


export const layoutNames = {
    COLUMNS: 'columns',
    FACE_TO_FACE: 'face to face',
    ZIG_ZAG: 'zig zag',
    SHEAVES: 'sheaves',
    META: 'meta',
};
