import {
    TreePage,
    SpaceLocation,
} from '@plurid/plurid-data';



export const SET_SPACE_LOADING = 'SET_SPACE_LOADING';
export interface SetSpaceLoadingAction {
    type: typeof SET_SPACE_LOADING;
    payload: boolean;
}


export const SET_SPACE_LOCATION = 'SET_SPACE_LOCATION';
export interface SetSpaceLocationAction {
    type: typeof SET_SPACE_LOCATION;
    payload: SpaceLocation;
}


export const ROTATE_UP = 'ROTATE_UP';
export interface RotateUpAction {
    type: typeof ROTATE_UP;
}

export const ROTATE_DOWN = 'ROTATE_DOWN';
export interface RotateDownAction {
    type: typeof ROTATE_DOWN;
}

export const ROTATE_LEFT = 'ROTATE_LEFT';
export interface RotateLeftAction {
    type: typeof ROTATE_LEFT;
}

export const ROTATE_X = 'ROTATE_X';
export interface RotateXAction {
    type: typeof ROTATE_X;
    payload: number;
}

export const ROTATE_X_WITH = 'ROTATE_X_WITH';
export interface RotateXWithAction {
    type: typeof ROTATE_X_WITH;
    payload: number;
}

export const ROTATE_RIGHT = 'ROTATE_RIGHT';
export interface RotateRightAction {
    type: typeof ROTATE_RIGHT;
}

export const ROTATE_Y = 'ROTATE_Y';
export interface RotateYAction {
    type: typeof ROTATE_Y;
    payload: number;
}

export const ROTATE_Y_WITH = 'ROTATE_Y_WITH';
export interface RotateYWithAction {
    type: typeof ROTATE_Y_WITH;
    payload: number;
}


export const TRANSLATE_UP = 'TRANSLATE_UP';
export interface TranslateUpAction {
    type: typeof TRANSLATE_UP;
}

export const TRANSLATE_DOWN = 'TRANSLATE_DOWN';
export interface TranslateDownAction {
    type: typeof TRANSLATE_DOWN;
}

export const TRANSLATE_LEFT = 'TRANSLATE_LEFT';
export interface TranslateLeftAction {
    type: typeof TRANSLATE_LEFT;
}

export const TRANSLATE_RIGHT = 'TRANSLATE_RIGHT';
export interface TranslateRightAction {
    type: typeof TRANSLATE_RIGHT;
}

export const TRANSLATE_X_WITH = 'TRANSLATE_X_WITH';
export interface TranslateXWithAction {
    type: typeof TRANSLATE_X_WITH;
    payload: number;
}

export const TRANSLATE_Y_WITH = 'TRANSLATE_Y_WITH';
export interface TranslateYWithAction {
    type: typeof TRANSLATE_Y_WITH;
    payload: number;
}


export const SCALE_UP = 'SCALE_UP';
export interface ScaleUpAction {
    type: typeof SCALE_UP;
}

export const SCALE_DOWN = 'SCALE_DOWN';
export interface ScaleDownAction {
    type: typeof SCALE_DOWN;
}


export const SET_TREE = 'SET_TREE';

export interface SetTreeAction {
    type: typeof SET_TREE;
    payload: TreePage[];
}


export const TOGGLE_ROTATION_LOCKED = 'TOGGLE_ROTATION_LOCKED';

export interface ToggleRotationLockedAction {
    type: typeof TOGGLE_ROTATION_LOCKED;
}


export const TOGGLE_TRANSLATION_LOCKED = 'TOGGLE_TRANSLATION_LOCKED';

export interface ToggleTranslationLockedAction {
    type: typeof TOGGLE_TRANSLATION_LOCKED;
}


export const TOGGLE_SCALE_LOCKED = 'TOGGLE_SCALE_LOCKED';

export interface ToggleScaleLockedAction {
    type: typeof TOGGLE_SCALE_LOCKED;
}


export const SET_ACTIVE_DOCUMENT = 'SET_ACTIVE_DOCUMENT';

export interface SetActiveDocumentAction {
    type: typeof SET_ACTIVE_DOCUMENT;
    payload: string;
}


export interface SpaceState {
    loading: boolean;
    scale: number;
    rotationX: number;
    rotationY: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    tree: TreePage[];
    rotationLocked: boolean;
    translationLocked: boolean;
    scaleLocked: boolean;
    activeDocumentID: string;
}


export type SpaceActionsType = SetSpaceLoadingAction
    | SetSpaceLocationAction
    | RotateUpAction
    | RotateDownAction
    | RotateXAction
    | RotateXWithAction
    | RotateLeftAction
    | RotateRightAction
    | RotateYAction
    | RotateYWithAction
    | TranslateUpAction
    | TranslateDownAction
    | TranslateLeftAction
    | TranslateRightAction
    | TranslateXWithAction
    | TranslateYWithAction
    | ScaleUpAction
    | ScaleDownAction
    | SetTreeAction
    | ToggleRotationLockedAction
    | ToggleScaleLockedAction
    | ToggleTranslationLockedAction
    | SetActiveDocumentAction;
