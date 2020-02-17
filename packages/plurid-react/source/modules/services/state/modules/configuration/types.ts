import {
    PluridConfiguration,

    SIZES,
    TRANSFORM_MODES,
    TRANSFORM_TOUCHES,
    TOOLBAR_DRAWERS,
    LAYOUT_TYPES,
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


export const TOGGLE_CONFIGURATION_VIEWCUBE_BUTTONS = 'TOGGLE_CONFIGURATION_VIEWCUBE_BUTTONS';
export interface ToggleConfigurationViewcubeButtonsAction {
    type: typeof TOGGLE_CONFIGURATION_VIEWCUBE_BUTTONS;
    payload: boolean;
}


export const TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE = 'TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE';
export interface ToggleConfigurationViewcubeOpaqueAction {
    type: typeof TOGGLE_CONFIGURATION_VIEWCUBE_OPAQUE;
    payload: boolean;
}


export const TOGGLE_CONFIGURATION_VIEWCUBE_CONCEAL = 'TOGGLE_CONFIGURATION_VIEWCUBE_CONCEAL';
export interface ToggleConfigurationViewcubeConcealAction {
    type: typeof TOGGLE_CONFIGURATION_VIEWCUBE_CONCEAL;
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


export const TOGGLE_CONFIGURATION_TOOLBAR_OPAQUE = 'TOGGLE_CONFIGURATION_TOOLBAR_OPAQUE';
export interface ToggleConfigurationToolbarOpaqueAction {
    type: typeof TOGGLE_CONFIGURATION_TOOLBAR_OPAQUE;
}


export const TOGGLE_CONFIGURATION_TOOLBAR_TOGGLE_DRAWER = 'TOGGLE_CONFIGURATION_TOOLBAR_TOGGLE_DRAWER';
export interface ToggleConfigurationToolbarToggleDrawerAction {
    type: typeof TOGGLE_CONFIGURATION_TOOLBAR_TOGGLE_DRAWER;
    payload: keyof typeof TOOLBAR_DRAWERS;
}


export const TOGGLE_CONFIGURATION_SPACE_TRANSPARENT_UI = 'TOGGLE_CONFIGURATION_SPACE_TRANSPARENT_UI';
export interface ToggleConfigurationSpaceTransparentUIAction {
    type: typeof TOGGLE_CONFIGURATION_SPACE_TRANSPARENT_UI;
}


export const TOGGLE_CONFIGURATION_SPACE_SHOW_TRANSFORM_ORIGIN = 'TOGGLE_CONFIGURATION_SPACE_SHOW_TRANSFORM_ORIGIN';
export interface ToggleConfigurationSpaceShowTransformOriginAction {
    type: typeof TOGGLE_CONFIGURATION_SPACE_SHOW_TRANSFORM_ORIGIN;
}


export const SET_CONFIGURATION_SPACE_TRANSFORM_ORIGIN_SIZE = 'SET_CONFIGURATION_SPACE_TRANSFORM_ORIGIN_SIZE';
export interface SetConfigurationSpaceTransformOriginSizeAction {
    type: typeof SET_CONFIGURATION_SPACE_TRANSFORM_ORIGIN_SIZE;
    payload: keyof typeof SIZES;
}


export const SET_CONFIGURATION_SPACE_TRANSFORM_MODE = 'SET_CONFIGURATION_SPACE_TRANSFORM_MODE';
export interface SetConfigurationSpaceTransformModeAction {
    type: typeof SET_CONFIGURATION_SPACE_TRANSFORM_MODE;
    payload: keyof typeof TRANSFORM_MODES;
}


export const TOGGLE_CONFIGURATION_SPACE_TRANSFORM_MULTIMODE = 'TOGGLE_CONFIGURATION_SPACE_TRANSFORM_MULTIMODE';
export interface ToggleConfigurationSpaceTransformMultimodeAction {
    type: typeof TOGGLE_CONFIGURATION_SPACE_TRANSFORM_MULTIMODE;
    payload: boolean;
}


export const SET_CONFIGURATION_SPACE_TRANSFORM_TOUCH = 'SET_CONFIGURATION_SPACE_TRANSFORM_TOUCH';
export interface SetConfigurationSpaceTransformTouchAction {
    type: typeof SET_CONFIGURATION_SPACE_TRANSFORM_TOUCH;
    payload: keyof typeof TRANSFORM_TOUCHES;
}


export const TOGGLE_CONFIGURATION_SPACE_FIRST_PERSON = 'TOGGLE_CONFIGURATION_SPACE_FIRST_PERSON';
export interface ToggleConfigurationSpaceFirstPersonAction {
    type: typeof TOGGLE_CONFIGURATION_SPACE_FIRST_PERSON;
}


export const SET_CONFIGURATION_SPACE_TRANSFORM_LOCKS = 'SET_CONFIGURATION_SPACE_TRANSFORM_LOCKS';
export interface SetConfigurationSpaceTransformLocksAction {
    type: typeof SET_CONFIGURATION_SPACE_TRANSFORM_LOCKS;
    payload: string;
}


export const SET_CONFIGURATION_SPACE_LAYOUT_TYPE = 'SET_CONFIGURATION_SPACE_LAYOUT_TYPE';
export interface SetConfigurationSpaceLayoutTypeAction {
    type: typeof SET_CONFIGURATION_SPACE_LAYOUT_TYPE;
    payload: keyof typeof LAYOUT_TYPES;
}



export interface State extends PluridConfiguration {
}


export type Actions = SetConfigurationAction
    | SetConfigurationMicroAction
    /** PLANE */
    | SetConfigurationPlaneControlsAction
    | SetConfigurationPlaneOpacityAction
    /** THEME */
    | SetConfigurationThemeGeneralAction
    | SetConfigurationThemeInteractionAction
    /** VIEWCUBE */
    | ToggleConfigurationViewcubeHideAction
    | ToggleConfigurationViewcubeButtonsAction
    | ToggleConfigurationViewcubeOpaqueAction
    | ToggleConfigurationViewcubeConcealAction
    /** TOOLBAR */
    | ToggleConfigurationToolbarConcealAction
    | ToggleConfigurationToolbarTransformIconsAction
    | ToggleConfigurationToolbarTransformButtonsAction
    | ToggleConfigurationToolbarOpaqueAction
    | ToggleConfigurationToolbarToggleDrawerAction
    /** SPACE */
    | ToggleConfigurationSpaceTransparentUIAction
    | ToggleConfigurationSpaceShowTransformOriginAction
    | SetConfigurationSpaceTransformOriginSizeAction
    | SetConfigurationSpaceTransformModeAction
    | ToggleConfigurationSpaceTransformMultimodeAction
    | SetConfigurationSpaceTransformTouchAction
    | ToggleConfigurationSpaceFirstPersonAction
    | SetConfigurationSpaceTransformLocksAction
    | SetConfigurationSpaceLayoutTypeAction;
