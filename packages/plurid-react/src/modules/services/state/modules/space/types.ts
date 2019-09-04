import {
    TreePage,
} from '../../../../data/interfaces';



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


// to parse this kind of tree and determine that there are
// two roots which need to be placed one near another
// the first root has a child which has a child
// to determine the locations of the children
const tree = [
    {
        planeId: 'aaa',
        path: '/aaaa',
        children: [
            {
                planeId: 'bbbb',
                path: '/aaaa/bbb',
                children: [
                    {
                        planeId: 'cccc',
                        path: '/aaaa/bbb/ccc',
                        children: [],
                    },
                ],
            },
        ],
    },
    {
        planeId: 'dddd',
        path: '/dddd',
        children: [],
    },
]


export interface SpaceState {
    scale: number;
    rotationX: number;
    rotationY: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    tree: TreePage[];
}


export type SpaceActionsType = RotateUpAction
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
