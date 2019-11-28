import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    SetConfigurationAction,
    SET_CONFIGURATION,
    SetMicroAction,
    SET_MICRO,

    SET_CONFIGURATION_THEME_GENERAL,
    SetConfigurationThemeGeneralAction,
    SET_CONFIGURATION_THEME_INTERACTION,
    SetConfigurationThemeInteractionAction,

    TOGGLE_UI_TOOLBAR_HIDE,
    ToggleUIToolbarHideAction,
    TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_ICONS,
    ToggleUIToolbarAlwaysShowIconsAction,
    TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_TRANSFORM_BUTTONS,
    ToggleUIToolbarAlwaysTransformButtonsAction
} from './types';



export const setConfiguration = (payload: PluridConfiguration): SetConfigurationAction => {
    return {
        type: SET_CONFIGURATION,
        payload,
    };
}


export const setMicro = (): SetMicroAction => {
    return {
        type: SET_MICRO,
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


export const toggleUIToolbarHideAction = (): ToggleUIToolbarHideAction => {
    return {
        type: TOGGLE_UI_TOOLBAR_HIDE,
    };
}


export const toggleUIToolbarAlwaysShowIconsAction = (): ToggleUIToolbarAlwaysShowIconsAction => {
    return {
        type: TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_ICONS,
    };
}


export const toggleUIToolbarAlwaysTransformButtonsAction = (): ToggleUIToolbarAlwaysTransformButtonsAction => {
    return {
        type: TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_TRANSFORM_BUTTONS,
    };
}
