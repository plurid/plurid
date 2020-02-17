import {
    PluridConfiguration,

    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,
    TOOLBAR_DRAWERS,
    LAYOUT_TYPES,
} from '@plurid/plurid-data';

import * as Types from './types';



export const setConfiguration = (
    payload: PluridConfiguration,
): Types.SetConfigurationAction => {
    return {
        type: Types.SET_CONFIGURATION,
        payload,
    };
}


export const setConfigurationMicro = (
): Types.SetConfigurationMicroAction => {
    return {
        type: Types.SET_CONFIGURATION_MICRO,
    };
}


export const setConfigurationPlaneControls = (
    planeControls: boolean,
): Types.SetConfigurationPlaneControlsAction => {
    return {
        type: Types.SET_CONFIGURATION_PLANE_CONTROLS,
        payload: planeControls,
    };
}


export const setConfigurationPlaneOpacity = (
    value: number,
): Types.SetConfigurationPlaneOpacityAction => {
    return {
        type: Types.SET_CONFIGURATION_PLANE_OPACITY,
        payload: value,
    };
}


export const setConfigurationThemeGeneralAction = (
    payload: string,
): Types.SetConfigurationThemeGeneralAction => {
    return {
        type: Types.SET_CONFIGURATION_THEME_GENERAL,
        payload,
    };
}


export const setConfigurationThemeInteractionAction = (
    payload: string,
): Types.SetConfigurationThemeInteractionAction => {
    return {
        type: Types.SET_CONFIGURATION_THEME_INTERACTION,
        payload,
    };
}


export const toggleConfigurationViewcubeHide = (
    toggle: boolean,
): Types.ToggleConfigurationViewcubeHideAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_VIEWCUBE_HIDE,
        payload: toggle,
    };
}


export const toggleConfigurationViewcubeButtons = (
    toggle: boolean,
): Types.ToggleConfigurationViewcubeButtonsAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_VIEWCUBE_BUTTONS,
        payload: toggle,
    };
}


export const toggleConfigurationViewcubeOpaque = (
    toggle: boolean,
): Types.ToggleConfigurationViewcubeOpaqueAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE,
        payload: toggle,
    };
}


export const toggleConfigurationViewcubeConceal = (
): Types.ToggleConfigurationViewcubeConcealAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_VIEWCUBE_CONCEAL,
    };
}


export const toggleConfigurationToolbarConceal = (
): Types.ToggleConfigurationToolbarConcealAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL,
    };
}


export const toggleConfigurationToolbarTransformIcons = (
): Types.ToggleConfigurationToolbarTransformIconsAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS,
    };
}


export const toggleConfigurationToolbarTransformButtons = (
): Types.ToggleConfigurationToolbarTransformButtonsAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS,
    };
}


export const toggleConfigurationSpaceTransparentUI = (
): Types.ToggleConfigurationSpaceTransparentUIAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_SPACE_TRANSPARENT_UI,
    };
}


export const toggleConfigurationSpaceShowTransformOrigin = (
): Types.ToggleConfigurationSpaceShowTransformOriginAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_SPACE_SHOW_TRANSFORM_ORIGIN,
    };
}


export const toggleConfigurationToolbarOpaque = (
): Types.ToggleConfigurationToolbarOpaqueAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_TOOLBAR_OPAQUE,
    };
}


export const toggleConfigurationToolbarToggleDrawer = (
    drawer: keyof typeof TOOLBAR_DRAWERS,
): Types.ToggleConfigurationToolbarToggleDrawerAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_TOOLBAR_TOGGLE_DRAWER,
        payload: drawer,
    };
}


export const setConfigurationSpaceTransformOriginSize = (
    size: keyof typeof SIZES,
): Types.SetConfigurationSpaceTransformOriginSizeAction => {
    return {
        type: Types.SET_CONFIGURATION_SPACE_TRANSFORM_ORIGIN_SIZE,
        payload: size,
    };
}


export const setConfigurationSpaceTransformMode = (
    mode: keyof typeof TRANSFORM_MODES,
): Types.SetConfigurationSpaceTransformModeAction => {
    return {
        type: Types.SET_CONFIGURATION_SPACE_TRANSFORM_MODE,
        payload: mode,
    };
}


export const toggleConfigurationSpaceTransformMultimode = (
    toggle: boolean,
): Types.ToggleConfigurationSpaceTransformMultimodeAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_SPACE_TRANSFORM_MULTIMODE,
        payload: toggle,
    };
}


export const setConfigurationSpaceTransformTouch = (
    touch: keyof typeof TRANSFORM_TOUCHES,
): Types.SetConfigurationSpaceTransformTouchAction => {
    return {
        type: Types.SET_CONFIGURATION_SPACE_TRANSFORM_TOUCH,
        payload: touch,
    };
}


export const toggleConfigurationSpaceFirstPerson = (
): Types.ToggleConfigurationSpaceFirstPersonAction => {
    return {
        type: Types.TOGGLE_CONFIGURATION_SPACE_FIRST_PERSON,
    };
}


export const setConfigurationSpaceTransformLocks = (
    transformLock: string,
): Types.SetConfigurationSpaceTransformLocksAction => {
    return {
        type: Types.SET_CONFIGURATION_SPACE_TRANSFORM_LOCKS,
        payload: transformLock,
    };
}


export const setConfigurationSpaceLayoutType = (
    layoutType: keyof typeof LAYOUT_TYPES,
): Types.SetConfigurationSpaceLayoutTypeAction => {
    return {
        type: Types.SET_CONFIGURATION_SPACE_LAYOUT_TYPE,
        payload: layoutType,
    };
}
