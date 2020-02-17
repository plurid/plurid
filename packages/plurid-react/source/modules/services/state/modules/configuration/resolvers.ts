import {
    TRANSFORM_MODES,

    LAYOUT_TYPES,
} from '@plurid/plurid-data';

import * as Types from './types';



export const setConfiguration = (
    state: Types.State,
    action: Types.SetConfigurationAction,
): Types.State => {
    return {
        ...state,
        ...action.payload,
    };
}


export const setConfigurationMicro = (
    state: Types.State,
): Types.State => {
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
    state: Types.State,
    action: Types.SetConfigurationPlaneControlsAction,
): Types.State => {
    const newState = {
        ...state,
    };

    newState.elements.plane.controls.show = action.payload;

    return {
        ...newState,
    };
}


export const setConfigurationPlaneOpacity = (
    state: Types.State,
    action: Types.SetConfigurationPlaneOpacityAction,
): Types.State => {
    const newState = {
        ...state,
    };

    newState.elements.plane.opacity = action.payload;

    return {
        ...newState,
    };
}


export const setConfigurationThemeGeneral = (
    state: Types.State,
    action: Types.SetConfigurationThemeGeneralAction,
): Types.State => {
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
    state: Types.State,
    action: Types.SetConfigurationThemeInteractionAction,
): Types.State => {
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
    state: Types.State,
    action: Types.ToggleConfigurationViewcubeHideAction,
): Types.State => {
    const newState = {
        ...state,
    };

    newState.elements.viewcube.show = action.payload;

    return {
        ...newState,
    };
}


export const toggleConfigurationViewcubeButtons = (
    state: Types.State,
    action: Types.ToggleConfigurationViewcubeButtonsAction,
): Types.State => {
    const newState = {
        ...state,
    };

    newState.elements.viewcube.buttons = action.payload;

    return {
        ...newState,
    };
}


export const toggleConfigurationViewcubeOpaque = (
    state: Types.State,
    action: Types.ToggleConfigurationViewcubeOpaqueAction,
): Types.State => {
    const newState = {
        ...state,
    };

    newState.elements.viewcube.opaque = action.payload;

    return {
        ...newState,
    };
}


export const toggleConfigurationViewcubeConceal = (
    state: Types.State,
): Types.State => {
    const {
        conceal,
    } = state.elements.viewcube;

    const newState = {
        ...state,
    };

    newState.elements.viewcube.conceal = !conceal;

    return {
        ...newState,
    };
}


export const toggleConfigurationToolbarConceal = (
    state: Types.State,
): Types.State => {
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
    state: Types.State,
): Types.State => {
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
    state: Types.State,
): Types.State => {
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
    state: Types.State,
): Types.State => {
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


export const toggleConfigurationToolbarOpaque = (
    state: Types.State,
): Types.State => {
    const {
        opaque,
    } = state.elements.toolbar;

    const newState = {
        ...state,
    };

    newState.elements.toolbar.opaque = !opaque;

    return {
        ...newState,
    };
}


export const toggleConfigurationSpaceTransparentUI = (
    state: Types.State,
): Types.State => {
    const newState = {
        ...state,
    };

    newState.transparentUI = !state.transparentUI;

    return {
        ...newState,
    };
}

export const setConfigurationSpaceTransformOriginSize = (
    state: Types.State,
    action: Types.SetConfigurationSpaceTransformOriginSizeAction,
): Types.State => {
    const newState = {
        ...state,
    };

    newState.space.transformOrigin.size = action.payload;

    return {
        ...newState,
    };
}


export const setConfigurationSpaceTransformMode = (
    state: Types.State,
    action: Types.SetConfigurationSpaceTransformModeAction,
): Types.State => {
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


export const toggleConfigurationSpaceTransformMultimode = (
    state: Types.State,
    action: Types.ToggleConfigurationSpaceTransformMultimodeAction,
): Types.State => {
    const newState = {
        ...state,
    };

    newState.space.transformMultimode = action.payload;

    return {
        ...newState,
    };
}


export const setConfigurationSpaceTransformTouch = (
    state: Types.State,
    action: Types.SetConfigurationSpaceTransformTouchAction,
): Types.State => {
    const newState = {
        ...state,
    };

    newState.space.transformTouch = action.payload;

    return {
        ...newState,
    };
}


export const toggleConfigurationSpaceFirstPerson = (
    state: Types.State,
): Types.State => {
    const {
        firstPerson,
    } = state.space;

    const newState = {
        ...state,
    };

    newState.space.firstPerson = !firstPerson;

    return {
        ...newState,
    };
}


export const toggleConfigurationToolbarToggleDrawer = (
    state: Types.State,
    action: Types.ToggleConfigurationToolbarToggleDrawerAction,
): Types.State => {
    const {
        toggledDrawers,
    } = state.elements.toolbar;

    const newState = {
        ...state,
    };

    if (toggledDrawers.includes(action.payload)) {
        const updatedDrawers = toggledDrawers.filter(el => el !== action.payload);
        newState.elements.toolbar.toggledDrawers = [...updatedDrawers];
    } else {
        newState.elements.toolbar.toggledDrawers = [
            ...toggledDrawers,
            action.payload,
        ];
    }

    return {
        ...newState,
    };
}


export const setConfigurationSpaceTransformLocks = (
    state: Types.State,
    action: Types.SetConfigurationSpaceTransformLocksAction,
): Types.State => {
    const {
        transformLocks,
    } = state.space;

    const newState = {
        ...state,
    };

    const updatedTransformLocks = {
        ...transformLocks,
    };
    updatedTransformLocks[action.payload] = !transformLocks[action.payload];
    newState.space.transformLocks = {
        ...updatedTransformLocks,
    };

    return {
        ...newState,
    };
}


export const setConfigurationSpaceLayout = (
    state: Types.State,
    action: Types.SetConfigurationSpaceLayoutTypeAction,
): Types.State => {
    const newState = {
        ...state,
    };

    const layout: any = {
        type: LAYOUT_TYPES[action.payload],
    }

    newState.space.layout = {
        ...layout,
    }

    return {
        ...newState,
    };
}
