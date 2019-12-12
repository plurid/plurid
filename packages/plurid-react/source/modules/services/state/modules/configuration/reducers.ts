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
    TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE,

    TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL,
    TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS,
    TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS,

    TOGGLE_CONFIGURATION_SPACE_SHOW_TRANSFORM_ORIGIN,
    SET_CONFIGURATION_SPACE_TRANSFORM_ORIGIN_SIZE,

    SET_CONFIGURATION_SPACE_TRANSFORM_MODE,
    SET_CONFIGURATION_SPACE_TRANSFORM_TOUCH,

    TOGGLE_CONFIGURATION_SPACE_FIRST_PERSON,

    TOGGLE_CONFIGURATION_TOOLBAR_TOGGLE_DRAWER,

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

    toggleConfigurationViewcubeHide,
    toggleConfigurationViewcubeOpaque,

    toggleConfigurationToolbarConceal,
    toggleConfigurationToolbarTransformIcons,
    toggleConfigurationToolbarTransformButtons,

    toggleConfigurationShowTransformOrigin,
    setConfigurationSpaceTransformOriginSize,

    setConfigurationSpaceTransformMode,
    setConfigurationSpaceTransformTouch,

    toggleConfigurationSpaceFirstPerson,

    toggleConfigurationToolbarToggleDrawer,
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
            return toggleConfigurationViewcubeHide(state, action);
        case TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE:
            return toggleConfigurationViewcubeOpaque(state, action);
        case TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL:
            return toggleConfigurationToolbarConceal(state);
        case TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS:
            return toggleConfigurationToolbarTransformIcons(state);
        case TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS:
            return toggleConfigurationToolbarTransformButtons(state);
        case TOGGLE_CONFIGURATION_SPACE_SHOW_TRANSFORM_ORIGIN:
            return toggleConfigurationShowTransformOrigin(state);
        case SET_CONFIGURATION_SPACE_TRANSFORM_ORIGIN_SIZE:
            return setConfigurationSpaceTransformOriginSize(state, action);
        case SET_CONFIGURATION_SPACE_TRANSFORM_MODE:
            return setConfigurationSpaceTransformMode(state, action);
        case SET_CONFIGURATION_SPACE_TRANSFORM_TOUCH:
            return setConfigurationSpaceTransformTouch(state, action);
        case TOGGLE_CONFIGURATION_SPACE_FIRST_PERSON:
            return toggleConfigurationSpaceFirstPerson(state);
        case TOGGLE_CONFIGURATION_TOOLBAR_TOGGLE_DRAWER:
            return toggleConfigurationToolbarToggleDrawer(state, action);
        default:
            return {
                ...state,
            };
    }
}


export default configurationReducer;
