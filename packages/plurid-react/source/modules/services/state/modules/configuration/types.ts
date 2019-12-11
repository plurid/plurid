import {
    PluridConfiguration,
} from '@plurid/plurid-data';



export const SET_CONFIGURATION = 'SET_CONFIGURATION';
export interface SetConfigurationAction {
    type: typeof SET_CONFIGURATION;
    payload: PluridConfiguration;
}


export const SET_CONFIGURATION_MICRO = 'SET_CONFIGURATION_MICRO';
export interface SetConfigurationMicroAction {
    type: typeof SET_CONFIGURATION_MICRO;
}


export const SET_CONFIGURATION_PLANE_CONTROLS = 'SET_CONFIGURATION_PLANE_CONTROLS';
export interface SetConfigurationPlaneControlsAction {
    type: typeof SET_CONFIGURATION_PLANE_CONTROLS;
    payload: boolean;
}


export const SET_CONFIGURATION_PLANE_OPACITY = 'SET_CONFIGURATION_PLANE_OPACITY';
export interface SetConfigurationPlaneOpacityAction {
    type: typeof SET_CONFIGURATION_PLANE_OPACITY;
    payload: number;
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


export const TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE = 'TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE';
export interface ToggleConfigurationViewcubeOpaqueAction {
    type: typeof TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE;
    payload: boolean;
}


export const TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL = 'TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL';
export interface ToggleConfigurationToolbarConcealAction {
    type: typeof TOGGLE_CONFIGURATION_TOOLBAR_CONCEAL;
}


export const TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS = 'TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS';
export interface ToggleConfigurationToolbarTransformIconsAction {
    type: typeof TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_ICONS;
}


export const TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS = 'TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS';
export interface ToggleConfigurationToolbarTransformButtonsAction {
    type: typeof TOGGLE_CONFIGURATION_TOOLBAR_TRANSFORM_BUTTONS;
}


export interface ConfigurationState extends PluridConfiguration {
}


export type ConfigurationActionsType = SetConfigurationAction
    | SetConfigurationMicroAction
    | SetConfigurationPlaneControlsAction
    | SetConfigurationPlaneOpacityAction
    | SetConfigurationThemeGeneralAction
    | SetConfigurationThemeInteractionAction
    | ToggleConfigurationViewcubeHideAction
    | ToggleConfigurationViewcubeOpaqueAction
    | ToggleConfigurationToolbarConcealAction
    | ToggleConfigurationToolbarTransformIconsAction
    | ToggleConfigurationToolbarTransformButtonsAction;
