import {
    TreePage,
    SpaceLocation,
    LinkCoordinates,
    PluridView,
} from '@plurid/plurid-data';



export const SET_SPACE_LOADING = 'SET_SPACE_LOADING';
export interface SetSpaceLoadingAction {
    type: typeof SET_SPACE_LOADING;
    payload: boolean;
}


export const SET_ANIMATED_TRANSFORM = 'SET_ANIMATED_TRANSFORM';
export interface SetAnimatedTransformAction {
    type: typeof SET_ANIMATED_TRANSFORM;
    payload: boolean;
}


export const SET_SPACE_LOCATION = 'SET_SPACE_LOCATION';
export interface SetSpaceLocationAction {
    type: typeof SET_SPACE_LOCATION;
    payload: SpaceLocation;
}



export const VIEW_CAMERA_MOVE_FORWARD = 'VIEW_CAMERA_MOVE_FORWARD';
export interface ViewCameraMoveForwardAction {
    type: typeof VIEW_CAMERA_MOVE_FORWARD;
}

export const VIEW_CAMERA_MOVE_BACKWARD = 'VIEW_CAMERA_MOVE_BACKWARD';
export interface ViewCameraMoveBackwardAction {
    type: typeof VIEW_CAMERA_MOVE_BACKWARD;
}


export const VIEW_CAMERA_MOVE_LEFT = 'VIEW_CAMERA_MOVE_LEFT';
export interface ViewCameraMoveLeftAction {
    type: typeof VIEW_CAMERA_MOVE_LEFT;
}

export const VIEW_CAMERA_MOVE_RIGHT = 'VIEW_CAMERA_MOVE_RIGHT';
export interface ViewCameraMoveRightAction {
    type: typeof VIEW_CAMERA_MOVE_RIGHT;
}


export const VIEW_CAMERA_MOVE_UP = 'VIEW_CAMERA_MOVE_UP';
export interface ViewCameraMoveUpAction {
    type: typeof VIEW_CAMERA_MOVE_UP;
}

export const VIEW_CAMERA_MOVE_DOWN = 'VIEW_CAMERA_MOVE_DOWN';
export interface ViewCameraMoveDownAction {
    type: typeof VIEW_CAMERA_MOVE_DOWN;
}


export const VIEW_CAMERA_TURN_UP = 'VIEW_CAMERA_TURN_UP';
export interface ViewCameraTurnUpAction {
    type: typeof VIEW_CAMERA_TURN_UP;
}

export const VIEW_CAMERA_TURN_DOWN = 'VIEW_CAMERA_TURN_DOWN';
export interface ViewCameraTurnDownAction {
    type: typeof VIEW_CAMERA_TURN_DOWN;
}


export const VIEW_CAMERA_TURN_LEFT = 'VIEW_CAMERA_TURN_LEFT';
export interface ViewCameraTurnLeftAction {
    type: typeof VIEW_CAMERA_TURN_LEFT;
}

export const VIEW_CAMERA_TURN_RIGHT = 'VIEW_CAMERA_TURN_RIGHT';
export interface ViewCameraTurnRightAction {
    type: typeof VIEW_CAMERA_TURN_RIGHT;
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


export const TRANSLATE_IN = 'TRANSLATE_IN';
export interface TranslateInAction {
    type: typeof TRANSLATE_IN;
}

export const TRANSLATE_OUT = 'TRANSLATE_OUT';
export interface TranslateOutAction {
    type: typeof TRANSLATE_OUT;
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


export const SCALE_UP_WITH = 'SCALE_UP_WITH';
export interface ScaleUpWithAction {
    type: typeof SCALE_UP_WITH;
    payload: number;
}

export const SCALE_DOWN_WITH = 'SCALE_DOWN_WITH';
export interface ScaleDownWithAction {
    type: typeof SCALE_DOWN_WITH;
    payload: number;
}


export const SET_TREE = 'SET_TREE';
export interface SetTreeAction {
    type: typeof SET_TREE;
    payload: TreePage[];
}


export const SET_ACTIVE_DOCUMENT = 'SET_ACTIVE_DOCUMENT';
export interface SetActiveDocumentAction {
    type: typeof SET_ACTIVE_DOCUMENT;
    payload: string;
}


export const SPACE_RESET_TRANSFORM = 'SPACE_RESET_TRANSFORM';
export interface SpaceResetTransformAction {
    type: typeof SPACE_RESET_TRANSFORM;
}


export const SET_VIEW_SIZE = 'SET_VIEW_SIZE';
export interface ViewSize {
    width: number;
    height: number;
}
export interface SetViewSizeAction {
    type: typeof SET_VIEW_SIZE;
    payload: ViewSize;
}


export const SET_SPACE_SIZE = 'SET_SPACE_SIZE';
export interface SpaceSize {
    width: number;
    height: number;
    depth: number;
    topCorner: {
        x: number;
        y: number;
        z: number;
    };
}
export interface SetSpaceSizeAction {
    type: typeof SET_SPACE_SIZE;
    payload: SpaceSize;
}


export const UPDATE_SPACE_TREE_PAGE = 'UPDATE_SPACE_TREE_PAGE';
export interface UpdateSpaceTreePageAction {
    type: typeof UPDATE_SPACE_TREE_PAGE;
    payload: TreePage;
}


export interface UpdateSpaceLinkCoordinatesPayload {
    planeID: string;
    linkCoordinates: LinkCoordinates;
}
export const UPDATE_SPACE_LINK_COORDINATES = 'UPDATE_SPACE_LINK_COORDINATES';
export interface UpdateSpaceLinkCoordinatesAction {
    type: typeof UPDATE_SPACE_LINK_COORDINATES;
    payload: UpdateSpaceLinkCoordinatesPayload;
}


export const SPACE_SET_VIEW = 'SPACE_SET_VIEW';
export interface SpaceSetViewAction {
    type: typeof SPACE_SET_VIEW;
    payload: string[] | PluridView[];
}



export interface Coordinates {
    x: number;
    y: number;
    z: number;
}



export interface State {
    loading: boolean;
    animatedTransform: boolean;
    scale: number;
    rotationX: number;
    rotationY: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    tree: TreePage[];
    activeDocumentID: string;
    camera: Coordinates;
    viewSize: ViewSize;
    spaceSize: SpaceSize;
    view: string[] | PluridView[];
}


export type Actions = SetSpaceLoadingAction
    | SetAnimatedTransformAction
    | SetSpaceLocationAction
    | ViewCameraMoveForwardAction
    | ViewCameraMoveBackwardAction
    | ViewCameraMoveLeftAction
    | ViewCameraMoveRightAction
    | ViewCameraMoveUpAction
    | ViewCameraMoveDownAction
    | ViewCameraTurnLeftAction
    | ViewCameraTurnRightAction
    | ViewCameraTurnUpAction
    | ViewCameraTurnDownAction
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
    | TranslateInAction
    | TranslateOutAction
    | TranslateXWithAction
    | TranslateYWithAction
    | ScaleUpAction
    | ScaleDownAction
    | ScaleUpWithAction
    | ScaleDownWithAction
    | SetTreeAction
    | SetActiveDocumentAction
    | SpaceResetTransformAction
    | SetViewSizeAction
    | SetSpaceSizeAction
    | UpdateSpaceTreePageAction
    | UpdateSpaceLinkCoordinatesAction
    | SpaceSetViewAction;
