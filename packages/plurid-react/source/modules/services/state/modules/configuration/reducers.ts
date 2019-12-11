import {
    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    SET_CONFIGURATION,
    SET_MICRO,
    SET_CONFIGURATION_PLANE_CONTROLS,
    SET_CONFIGURATION_PLANE_OPACITY,

    SET_CONFIGURATION_THEME_GENERAL,
    SET_CONFIGURATION_THEME_INTERACTION,

    TOGGLE_CONFIGURATION_VIEWCUBE_HIDE,
    TOGGLE_CONFIGURATION_UI_VIEWCUBE_TRANSPARENT,

    TOGGLE_UI_TOOLBAR_HIDE,
    TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_ICONS,
    TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_TRANSFORM_BUTTONS,

    ConfigurationState,
    ConfigurationActionsType,
} from './types';



const initialState: ConfigurationState = {
    ...defaultConfiguration,
}

const configurationReducer = (
    state: ConfigurationState = initialState,
    action: ConfigurationActionsType,
): ConfigurationState => {
    switch(action.type) {
        case SET_CONFIGURATION:
            return {
                ...state,
                ...action.payload,
            };
        case SET_MICRO:
            {
                const updatedState = {...state};
                updatedState.elements.toolbar.show = false;
                updatedState.elements.plane.controls.show = false;
                updatedState.elements.viewcube.show = false;
                return {...updatedState};
            }
        case SET_CONFIGURATION_PLANE_CONTROLS:
            {
                const updatedState = {...state};
                updatedState.elements.plane.controls.show = action.payload;
                return {...updatedState};
            }
        case SET_CONFIGURATION_PLANE_OPACITY:
            {
                const updatedState = {...state};
                updatedState.elements.plane.opacity = action.payload;
                return {...updatedState};
            }
        case SET_CONFIGURATION_THEME_GENERAL:
            {
                const updatedTheme = {
                    general: action.payload,
                    interaction: typeof state.theme === 'object'
                        ? state.theme.interaction
                        : 'plurid',
                }

                return {
                    ...state,
                    theme: updatedTheme,
                };
            }
        case SET_CONFIGURATION_THEME_INTERACTION:
            {
                const updatedTheme = {
                    general: typeof state.theme === 'object'
                        ? state.theme.general
                        : 'plurid',
                    interaction: action.payload,
                }

                return {
                    ...state,
                    theme: updatedTheme,
                };
            }
        case TOGGLE_CONFIGURATION_VIEWCUBE_HIDE:
            {
                const updatedState = {...state};
                updatedState.elements.viewcube.show = action.payload;
                return {...updatedState};
            }
        case TOGGLE_CONFIGURATION_UI_VIEWCUBE_TRANSPARENT:
            {
                const updatedState = {...state};
                updatedState.elements.viewcube.opaque = action.payload;
                return {...updatedState};
            }
        case TOGGLE_UI_TOOLBAR_HIDE:
            {
                const {
                    conceal,
                } = state.elements.toolbar;

                const updatedState = {...state};
                updatedState.elements.toolbar.conceal = !conceal;
                return {...updatedState};
            }
        case TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_ICONS:
            {
                const {
                    transformIcons,
                } = state.elements.toolbar;

                const updatedState = {...state};
                updatedState.elements.toolbar.transformIcons = !transformIcons;
                return {...updatedState};
            }
        case TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_TRANSFORM_BUTTONS:
            {
                const {
                    transformButtons,
                } = state.elements.toolbar;

                const updatedState = {...state};
                updatedState.elements.toolbar.transformButtons = !transformButtons;
                return {...updatedState};
            }
        default:
            return {
                ...state,
            };
    }
}


export default configurationReducer;
