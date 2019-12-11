import {
    ConfigurationState,

    SetConfigurationAction,
    SetConfigurationPlaneControlsAction,
    SetConfigurationPlaneOpacityAction,
    SetConfigurationThemeGeneralAction,
    SetConfigurationThemeInteractionAction,
} from './types';



export const setConfiguration = (
    state: ConfigurationState,
    action: SetConfigurationAction,
): ConfigurationState => {
    return {
        ...state,
        ...action.payload,
    };
}


export const setConfigurationMicro = (
    state: ConfigurationState,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    newState.elements.toolbar.show = false;
    newState.elements.plane.controls.show = false;
    newState.elements.viewcube.show = false;

    return {
        ...newState,
    };
}


export const setConfigurationPlaneControls = (
    state: ConfigurationState,
    action: SetConfigurationPlaneControlsAction,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    newState.elements.plane.controls.show = action.payload;

    return {
        ...newState,
    };
}


export const setConfigurationPlaneOpacity = (
    state: ConfigurationState,
    action: SetConfigurationPlaneOpacityAction,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    newState.elements.plane.opacity = action.payload;

    return {
        ...newState,
    };
}


export const setConfigurationThemeGeneral = (
    state: ConfigurationState,
    action: SetConfigurationThemeGeneralAction,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    const updatedTheme = {
        general: action.payload,
        interaction: typeof newState.theme === 'object'
            ? newState.theme.interaction
            : 'plurid',
    }

    return {
        ...newState,
        theme: updatedTheme,
    };
}


export const setConfigurationThemeInteraction = (
    state: ConfigurationState,
    action: SetConfigurationThemeInteractionAction,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    const updatedTheme = {
        general: typeof newState.theme === 'object'
            ? newState.theme.general
            : 'plurid',
        interaction: action.payload,
    }

    return {
        ...newState,
        theme: updatedTheme,
    };
}
