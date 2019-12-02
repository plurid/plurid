import {
    PluridConfiguration,
} from '@plurid/plurid-data';



export const SET_CONFIGURATION = 'SET_CONFIGURATION';
export interface SetConfigurationAction {
    type: typeof SET_CONFIGURATION;
    payload: PluridConfiguration;
}


export const SET_MICRO = 'SET_MICRO';
export interface SetMicroAction {
    type: typeof SET_MICRO;
}


export const SET_CONFIGURATION_PLANE_CONTROLS = 'SET_CONFIGURATION_PLANE_CONTROLS';
export interface SetConfigurationPlaneControlsAction {
    type: typeof SET_CONFIGURATION_PLANE_CONTROLS;
    payload: boolean;
}


export const SET_CONFIGURATION_THEME_GENERAL = 'SET_CONFIGURATION_THEME_GENERAL';
export interface SetConfigurationThemeGeneralAction {
    type: typeof SET_CONFIGURATION_THEME_GENERAL;
    payload: string;
}


export const SET_CONFIGURATION_THEME_INTERACTION = 'SET_CONFIGURATION_THEME_INTERACTION';
export interface SetConfigurationThemeInteractionAction {
    type: typeof SET_CONFIGURATION_THEME_INTERACTION;
    payload: string;
}


export const TOGGLE_CONFIGURATION_VIEWCUBE_HIDE = 'TOGGLE_CONFIGURATION_VIEWCUBE_HIDE';
export interface ToggleConfigurationViewcubeHideAction {
    type: typeof TOGGLE_CONFIGURATION_VIEWCUBE_HIDE;
    payload: boolean;
}


export const TOGGLE_CONFIGURATION_UI_VIEWCUBE_TRANSPARENT = 'TOGGLE_CONFIGURATION_UI_VIEWCUBE_TRANSPARENT';
export interface ToggleConfigurationUIViewcubeTransparentAction {
    type: typeof TOGGLE_CONFIGURATION_UI_VIEWCUBE_TRANSPARENT;
    payload: boolean;
}


export const TOGGLE_UI_TOOLBAR_HIDE = 'TOGGLE_UI_TOOLBAR_HIDE';
export interface ToggleUIToolbarHideAction {
    type: typeof TOGGLE_UI_TOOLBAR_HIDE;
}


export const TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_ICONS = 'TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_ICONS';
export interface ToggleUIToolbarAlwaysShowIconsAction {
    type: typeof TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_ICONS;
}


export const TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_TRANSFORM_BUTTONS = 'TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_TRANSFORM_BUTTONS';
export interface ToggleUIToolbarAlwaysTransformButtonsAction {
    type: typeof TOGGLE_UI_TOOLBAR_ALWAYS_SHOW_TRANSFORM_BUTTONS;
}


export interface ConfigurationState extends PluridConfiguration {
}


export type ConfigurationActionsType = SetConfigurationAction
    | SetMicroAction
    | SetConfigurationPlaneControlsAction
    | SetConfigurationThemeGeneralAction
    | SetConfigurationThemeInteractionAction
    | ToggleConfigurationViewcubeHideAction
    | ToggleConfigurationUIViewcubeTransparentAction
    | ToggleUIToolbarHideAction
    | ToggleUIToolbarAlwaysShowIconsAction
    | ToggleUIToolbarAlwaysTransformButtonsAction;
