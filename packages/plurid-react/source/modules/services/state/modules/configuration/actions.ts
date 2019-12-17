import {
    PluridConfiguration,

    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,
    TOOLBAR_DRAWERS,
    LAYOUT_TYPES,
} from '@plurid/plurid-data';

import {
    SetConfigurationAction,
    SET_CONFIGURATION,
    SetConfigurationMicroAction,
    SET_CONFIGURATION_MICRO,

    SET_CONFIGURATION_PLANE_CONTROLS,
    SetConfigurationPlaneControlsAction,

    SET_CONFIGURATION_PLANE_OPACITY,
    SetConfigurationPlaneOpacityAction,

    SET_CONFIGURATION_THEME_GENERAL,
    SetConfigurationThemeGeneralAction,
    SET_CONFIGURATION_THEME_INTERACTION,
    SetConfigurationThemeInteractionAction,

    TOGGLE_CONFIGURATION_VIEWCUBE_HIDE,
    ToggleConfigurationViewcubeHideAction,
    TOGGLE_CONFIGURATION_VIEWCUBE_BUTTONS,
    ToggleConfigurationViewcubeButtonsAction,
    TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE,
    ToggleConfigurationViewcubeOpaqueAction,
    TOGGLE_CONFIGURATION_VIEWCUBE_CONCEAL,
    ToggleConfigurationViewcubeConcealAction,

    TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL,
    ToggleConfigurationToolbarConcealAction,
    TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS,
    ToggleConfigurationToolbarTransformIconsAction,
    TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS,
    ToggleConfigurationToolbarTransformButtonsAction,
    TOGGLE_CONFIGURATION_TOOLBAR_OPAQUE,
    ToggleConfigurationToolbarOpaqueAction,
    TOGGLE_CONFIGURATION_TOOLBAR_TOGGLE_DRAWER,
    ToggleConfigurationToolbarToggleDrawerAction,

    TOGGLE_CONFIGURATION_SPACE_SHOW_TRANSFORM_ORIGIN,
    ToggleConfigurationSpaceShowTransformOriginAction,
    SET_CONFIGURATION_SPACE_TRANSFORM_ORIGIN_SIZE,
    SetConfigurationSpaceTransformOriginSizeAction,

    SET_CONFIGURATION_SPACE_TRANSFORM_MODE,
    SetConfigurationSpaceTransformModeAction,
    SET_CONFIGURATION_SPACE_TRANSFORM_TOUCH,
    SetConfigurationSpaceTransformTouchAction,

    TOGGLE_CONFIGURATION_SPACE_FIRST_PERSON,
    ToggleConfigurationSpaceFirstPersonAction,

    SET_CONFIGURATION_SPACE_TRANSFORM_LOCKS,
    SetConfigurationSpaceTransformLocksAction,

    SET_CONFIGURATION_SPACE_LAYOUT_TYPE,
    SetConfigurationSpaceLayoutTypeAction,
} from './types';



export const setConfiguration = (payload: PluridConfiguration): SetConfigurationAction => {
    return {
        type: SET_CONFIGURATION,
        payload,
    };
}


export const setConfigurationMicro = (): SetConfigurationMicroAction => {
    return {
        type: SET_CONFIGURATION_MICRO,
    };
}


export const setConfigurationPlaneControls = (
    planeControls: boolean,
): SetConfigurationPlaneControlsAction => {
    return {
        type: SET_CONFIGURATION_PLANE_CONTROLS,
        payload: planeControls,
    };
}


export const setConfigurationPlaneOpacity = (
    value: number,
): SetConfigurationPlaneOpacityAction => {
    return {
        type: SET_CONFIGURATION_PLANE_OPACITY,
        payload: value,
    };
}


export const setConfigurationThemeGeneralAction = (
    payload: string,
): SetConfigurationThemeGeneralAction => {
    return {
        type: SET_CONFIGURATION_THEME_GENERAL,
        payload,
    };
}


export const setConfigurationThemeInteractionAction = (
    payload: string,
): SetConfigurationThemeInteractionAction => {
    return {
        type: SET_CONFIGURATION_THEME_INTERACTION,
        payload,
    };
}


export const toggleConfigurationViewcubeHide = (
    toggle: boolean,
): ToggleConfigurationViewcubeHideAction => {
    return {
        type: TOGGLE_CONFIGURATION_VIEWCUBE_HIDE,
        payload: toggle,
    };
}


export const toggleConfigurationViewcubeButtons = (
    toggle: boolean,
): ToggleConfigurationViewcubeButtonsAction => {
    return {
        type: TOGGLE_CONFIGURATION_VIEWCUBE_BUTTONS,
        payload: toggle,
    };
}


export const toggleConfigurationViewcubeOpaque = (
    toggle: boolean,
): ToggleConfigurationViewcubeOpaqueAction => {
    return {
        type: TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE,
        payload: toggle,
    };
}


export const toggleConfigurationViewcubeConceal = (): ToggleConfigurationViewcubeConcealAction => {
    return {
        type: TOGGLE_CONFIGURATION_VIEWCUBE_CONCEAL,
    };
}


export const toggleConfigurationToolbarConceal = (): ToggleConfigurationToolbarConcealAction => {
    return {
        type: TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL,
    };
}


export const toggleConfigurationToolbarTransformIcons = (): ToggleConfigurationToolbarTransformIconsAction => {
    return {
        type: TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS,
    };
}


export const toggleConfigurationToolbarTransformButtons = (): ToggleConfigurationToolbarTransformButtonsAction => {
    return {
        type: TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS,
    };
}


export const toggleConfigurationSpaceShowTransformOrigin = (): ToggleConfigurationSpaceShowTransformOriginAction => {
    return {
        type: TOGGLE_CONFIGURATION_SPACE_SHOW_TRANSFORM_ORIGIN,
    };
}


export const toggleConfigurationToolbarOpaque = (): ToggleConfigurationToolbarOpaqueAction => {
    return {
        type: TOGGLE_CONFIGURATION_TOOLBAR_OPAQUE,
    };
}


export const toggleConfigurationToolbarToggleDrawer = (
    drawer: keyof typeof TOOLBAR_DRAWERS,
): ToggleConfigurationToolbarToggleDrawerAction => {
    return {
        type: TOGGLE_CONFIGURATION_TOOLBAR_TOGGLE_DRAWER,
        payload: drawer,
    };
}


export const setConfigurationSpaceTransformOriginSize = (
    size: keyof typeof SIZES,
): SetConfigurationSpaceTransformOriginSizeAction => {
    return {
        type: SET_CONFIGURATION_SPACE_TRANSFORM_ORIGIN_SIZE,
        payload: size,
    };
}


export const setConfigurationSpaceTransformMode = (
    mode: keyof typeof TRANSFORM_MODES,
): SetConfigurationSpaceTransformModeAction => {
    return {
        type: SET_CONFIGURATION_SPACE_TRANSFORM_MODE,
        payload: mode,
    };
}


export const setConfigurationSpaceTransformTouch = (
    touch: keyof typeof TRANSFORM_TOUCHES,
): SetConfigurationSpaceTransformTouchAction => {
    return {
        type: SET_CONFIGURATION_SPACE_TRANSFORM_TOUCH,
        payload: touch,
    };
}


export const toggleConfigurationSpaceFirstPerson = (): ToggleConfigurationSpaceFirstPersonAction => {
    return {
        type: TOGGLE_CONFIGURATION_SPACE_FIRST_PERSON,
    };
}


export const setConfigurationSpaceTransformLocks = (
    transformLock: string,
): SetConfigurationSpaceTransformLocksAction => {
    return {
        type: SET_CONFIGURATION_SPACE_TRANSFORM_LOCKS,
        payload: transformLock,
    };
}


export const setConfigurationSpaceLayoutType = (
    layoutType: keyof typeof LAYOUT_TYPES,
): SetConfigurationSpaceLayoutTypeAction => {
    return {
        type: SET_CONFIGURATION_SPACE_LAYOUT_TYPE,
        payload: layoutType,
    };
}
