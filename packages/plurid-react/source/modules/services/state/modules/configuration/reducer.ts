import * as Types from './types';

import initialState from './initial';

import * as resolvers from './resolvers';



const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case Types.SET_CONFIGURATION:
            return resolvers.setConfiguration(state, action);
        case Types.SET_CONFIGURATION_MICRO:
            return resolvers.setConfigurationMicro(state);

        case Types.SET_CONFIGURATION_PLANE_CONTROLS:
            return resolvers.setConfigurationPlaneControls(state, action);
        case Types.SET_CONFIGURATION_PLANE_OPACITY:
            return resolvers.setConfigurationPlaneOpacity(state, action);

        case Types.SET_CONFIGURATION_THEME_GENERAL:
            return resolvers.setConfigurationThemeGeneral(state, action);
        case Types.SET_CONFIGURATION_THEME_INTERACTION:
            return resolvers.setConfigurationThemeInteraction(state, action);

        case Types.TOGGLE_CONFIGURATION_VIEWCUBE_HIDE:
            return resolvers.toggleConfigurationViewcubeHide(state, action);
        case Types.TOGGLE_CONFIGURATION_VIEWCUBE_BUTTONS:
            return resolvers.toggleConfigurationViewcubeButtons(state, action);
        case Types.TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE:
            return resolvers.toggleConfigurationViewcubeOpaque(state, action);
        case Types.TOGGLE_CONFIGURATION_VIEWCUBE_CONCEAL:
            return resolvers.toggleConfigurationViewcubeConceal(state);

        case Types.TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL:
            return resolvers.toggleConfigurationToolbarConceal(state);
        case Types.TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS:
            return resolvers.toggleConfigurationToolbarTransformIcons(state);
        case Types.TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS:
            return resolvers.toggleConfigurationToolbarTransformButtons(state);
        case Types.TOGGLE_CONFIGURATION_TOOLBAR_TOGGLE_DRAWER:
            return resolvers.toggleConfigurationToolbarToggleDrawer(state, action);
        case Types.TOGGLE_CONFIGURATION_TOOLBAR_OPAQUE:
            return resolvers.toggleConfigurationToolbarOpaque(state);

        case Types.TOGGLE_CONFIGURATION_SPACE_TRANSPARENT_UI:
            return resolvers.toggleConfigurationSpaceTransparentUI(state);
        case Types.TOGGLE_CONFIGURATION_SPACE_SHOW_TRANSFORM_ORIGIN:
            return resolvers.toggleConfigurationShowTransformOrigin(state);
        case Types.SET_CONFIGURATION_SPACE_TRANSFORM_ORIGIN_SIZE:
            return resolvers.setConfigurationSpaceTransformOriginSize(state, action);
        case Types.SET_CONFIGURATION_SPACE_TRANSFORM_MODE:
            return resolvers.setConfigurationSpaceTransformMode(state, action);
        case Types.TOGGLE_CONFIGURATION_SPACE_TRANSFORM_MULTIMODE:
            return resolvers.toggleConfigurationSpaceTransformMultimode(state, action);
        case Types.SET_CONFIGURATION_SPACE_TRANSFORM_TOUCH:
            return resolvers.setConfigurationSpaceTransformTouch(state, action);
        case Types.TOGGLE_CONFIGURATION_SPACE_FIRST_PERSON:
            return resolvers.toggleConfigurationSpaceFirstPerson(state);
        case Types.SET_CONFIGURATION_SPACE_TRANSFORM_LOCKS:
            return resolvers.setConfigurationSpaceTransformLocks(state, action);
        case Types.SET_CONFIGURATION_SPACE_LAYOUT_TYPE:
            return resolvers.setConfigurationSpaceLayout(state, action);

        default:
            return {
                ...state,
            };
    }
}


export default reducer;
