import {
    PluridConfiguration,
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
    TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE,
    ToggleConfigurationViewcubeOpaqueAction,

    TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL,
    ToggleConfigurationToolbarConcealAction,
    TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS,
    ToggleConfigurationToolbarTransformIconsAction,
    TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS,
    ToggleConfigurationToolbarTransformButtonsAction,
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


export const toggleConfigurationViewcubeOpaque = (
    toggle: boolean,
): ToggleConfigurationViewcubeOpaqueAction => {
    return {
        type: TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE,
        payload: toggle,
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
