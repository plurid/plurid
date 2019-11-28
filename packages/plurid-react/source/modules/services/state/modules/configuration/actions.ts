import {
    PluridConfiguration,
} from '@plurid/plurid-data';

import {
    SetConfigurationAction,
    SET_CONFIGURATION,
    SetMicroAction,
    SET_MICRO,

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
