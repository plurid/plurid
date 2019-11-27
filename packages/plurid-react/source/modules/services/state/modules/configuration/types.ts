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
    | ToggleUIToolbarAlwaysShowIconsAction
    | ToggleUIToolbarAlwaysTransformButtonsAction;
