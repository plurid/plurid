import {
    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    SET_CONFIGURATION,
    SET_CONFIGURATION_MICRO,
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

import {
    setConfiguration,
    setConfigurationMicro,
    setConfigurationPlaneControls,
    setConfigurationPlaneOpacity,
    setConfigurationThemeGeneral,
    setConfigurationThemeInteraction,
} from './resolvers';



const initialState: ConfigurationState = {
    ...defaultConfiguration,
}

const configurationReducer = (
    state: ConfigurationState = initialState,
    action: ConfigurationActionsType,
): ConfigurationState => {
    switch(action.type) {
        case SET_CONFIGURATION:
            return setConfiguration(state, action);
        case SET_CONFIGURATION_MICRO:
            return setConfigurationMicro(state);
        case SET_CONFIGURATION_PLANE_CONTROLS:
            return setConfigurationPlaneControls(state, action);
        case SET_CONFIGURATION_PLANE_OPACITY:
            return setConfigurationPlaneOpacity(state, action);
        case SET_CONFIGURATION_THEME_GENERAL:
            return setConfigurationThemeGeneral(state, action);
        case SET_CONFIGURATION_THEME_INTERACTION:
            return setConfigurationThemeInteraction(state, action);
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
