import {
    TRANSFORM_MODES,
} from '@plurid/plurid-data';

import {
    ConfigurationState,

    SetConfigurationAction,
    SetConfigurationPlaneControlsAction,
    SetConfigurationPlaneOpacityAction,
    SetConfigurationThemeGeneralAction,
    SetConfigurationThemeInteractionAction,

    ToggleConfigurationViewcubeHideAction,
    ToggleConfigurationViewcubeOpaqueAction,

    SetConfigurationSpaceTransformOriginSizeAction,

    SetConfigurationSpaceTransformModeAction,
    SetConfigurationSpaceTransformTouchAction,
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


export const toggleConfigurationViewcubeHide = (
    state: ConfigurationState,
    action: ToggleConfigurationViewcubeHideAction,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    newState.elements.viewcube.show = action.payload;

    return {
        ...newState,
    };
}


export const toggleConfigurationViewcubeOpaque = (
    state: ConfigurationState,
    action: ToggleConfigurationViewcubeOpaqueAction,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    newState.elements.viewcube.opaque = action.payload;

    return {
        ...newState,
    };
}


export const toggleConfigurationToolbarConceal = (
    state: ConfigurationState,
): ConfigurationState => {
    const {
        conceal,
    } = state.elements.toolbar;

    const newState = {
        ...state,
    };

    newState.elements.toolbar.conceal = !conceal;

    return {
        ...newState,
    };
}


export const toggleConfigurationToolbarTransformIcons = (
    state: ConfigurationState,
): ConfigurationState => {
    const {
        transformIcons,
    } = state.elements.toolbar;

    const newState = {
        ...state,
    };

    newState.elements.toolbar.transformIcons = !transformIcons;

    return {
        ...newState,
    };
}


export const toggleConfigurationToolbarTransformButtons = (
    state: ConfigurationState,
): ConfigurationState => {
    const {
        transformButtons,
    } = state.elements.toolbar;

    const newState = {
        ...state,
    };

    newState.elements.toolbar.transformButtons = !transformButtons;

    return {
        ...newState,
    };
}


export const toggleConfigurationShowTransformOrigin = (
    state: ConfigurationState,
): ConfigurationState => {
    const {
        show,
    } = state.space.transformOrigin;

    const newState = {
        ...state,
    };

    newState.space.transformOrigin.show = !show;

    return {
        ...newState,
    };
}


export const setConfigurationSpaceTransformOriginSize = (
    state: ConfigurationState,
    action: SetConfigurationSpaceTransformOriginSizeAction,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    newState.space.transformOrigin.size = action.payload;

    return {
        ...newState,
    };
}


export const setConfigurationSpaceTransformMode = (
    state: ConfigurationState,
    action: SetConfigurationSpaceTransformModeAction,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    if (
        newState.space.transformMode !== action.payload
    ) {
        newState.space.transformMode = action.payload;
    } else {
        newState.space.transformMode = TRANSFORM_MODES.ALL;
    }

    return {
        ...newState,
    };
}


export const setConfigurationSpaceTransformTouch = (
    state: ConfigurationState,
    action: SetConfigurationSpaceTransformTouchAction,
): ConfigurationState => {
    const newState = {
        ...state,
    };

    newState.space.transformTouch = action.payload;

    return {
        ...newState,
    };
}
