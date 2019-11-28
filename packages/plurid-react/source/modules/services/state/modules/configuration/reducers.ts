import {
    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    SET_CONFIGURATION,
    SET_MICRO,

    SET_CONFIGURATION_THEME_GENERAL,
    SET_CONFIGURATION_THEME_INTERACTION,

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
            return {
                ...state,
                toolbar: false,
                planeControls: false,
                viewcube: false,
            };
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
        case TOGGLE_UI_TOOLBAR_HIDE:
            {
                const {
                    hide,
                } = state.ui.toolbar;

                return {
                    ...state,
                    ui: {
                        ...state.ui,
                        toolbar: {
                            ...state.ui.toolbar,
                            hide: !hide,
                        },
                    },
                };
            }
        case TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_ICONS:
            {
                const {
                    alwaysShowIcons,
                } = state.ui.toolbar;

                return {
                    ...state,
                    ui: {
                        ...state.ui,
                        toolbar: {
                            ...state.ui.toolbar,
                            alwaysShowIcons: !alwaysShowIcons,
                        },
                    },
                };
            }
        case TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_TRANSFORM_BUTTONS:
            {
                const {
                    alwaysShowTransformButtons,
                } = state.ui.toolbar;

                return {
                    ...state,
                    ui: {
                        ...state.ui,
                        toolbar: {
                            ...state.ui.toolbar,
                            alwaysShowTransformButtons: !alwaysShowTransformButtons,
                        },
                    },
                };
            }
        default:
            return {
                ...state,
            };
    }
}


export default configurationReducer;
