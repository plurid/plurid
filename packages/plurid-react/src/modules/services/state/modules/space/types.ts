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

export const ROTATE_RIGHT = 'ROTATE_RIGHT';
export interface RotateRightAction {
    type: typeof ROTATE_RIGHT;
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


export interface SpaceState {
    loading: boolean;
    scale: number;
    rotationX: number;
    rotationY: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    tree: TreePage[];
}


export type SpaceActionsType = SetSpaceLoadingAction
    | SetSpaceLocationAction
    | RotateUpAction
    | RotateDownAction
    | RotateLeftAction
    | RotateRightAction
    | TranslateUpAction
    | TranslateDownAction
    | TranslateLeftAction
    | TranslateRightAction
    | ScaleUpAction
    | ScaleDownAction
    | SetTreeAction;
