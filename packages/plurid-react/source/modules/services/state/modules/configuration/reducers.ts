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
            return {
                ...state,
                elements: {
                    ...state.elements,
                    toolbar: {
                        ...state.elements.toolbar,
                        // show: false,
                    },
                    plane: {
                        ...state.elements.plane,
                        controls: {
                            ...state.elements.plane.controls,
                            show: false,
                        },
                    },
                    viewcube: {
                        ...state.elements.viewcube,
                        show: false,
                    }
                },
            };
        case SET_CONFIGURATION_PLANE_CONTROLS:
            return {
                ...state,
                elements: {
                    ...state.elements,
                    plane: {
                        ...state.elements.plane,
                        controls: {
                            ...state.elements.plane.controls,
                            show: action.payload,
                        },
                    },
                },
            };
        case SET_CONFIGURATION_PLANE_OPACITY:
            return {
                ...state,
                elements: {
                    ...state.elements,
                    plane: {
                        ...state.elements.plane,
                        opacity: action.payload,
                    },
                },
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
        case TOGGLE_CONFIGURATION_VIEWCUBE_HIDE:
            {
                return {
                    ...state,
                    elements: {
                        ...state.elements,
                        viewcube: {
                            ...state.elements.viewcube,
                            show: action.payload,
                        },
                    },
                };
            }
        case TOGGLE_CONFIGURATION_UI_VIEWCUBE_TRANSPARENT:
            {
                return {
                    ...state,
                    elements: {
                        ...state.elements,
                        viewcube: {
                            ...state.elements.viewcube,
                            opaque: action.payload,
                        },
                    },
                };
            }
        case TOGGLE_UI_TOOLBAR_HIDE:
            {
                const {
                    conceal,
                } = state.elements.toolbar;

                return {
                    ...state,
                    elements: {
                        ...state.elements,
                        toolbar: {
                            ...state.elements.toolbar,
                            conceal: !conceal,
                        }
                    }
                };
            }
        case TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_ICONS:
            {
                const {
                    transformIcons,
                } = state.elements.toolbar;

                return {
                    ...state,
                    elements: {
                        ...state.elements,
                        toolbar: {
                            ...state.elements.toolbar,
                            transformIcons: !transformIcons,
                        },
                    },
                };
            }
        case TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_TRANSFORM_BUTTONS:
            {
                const {
                    transformButtons,
                } = state.elements.toolbar;

                return {
                    ...state,
                    elements: {
                        ...state.elements,
                        toolbar: {
                            ...state.elements.toolbar,
                            transformButtons: !transformButtons,
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
