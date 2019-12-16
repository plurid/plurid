import {
    SET_SPACE_LOADING,

    SET_ANIMATED_TRANSFORM,

    SET_SPACE_LOCATION,

    VIEW_CAMERA_MOVE_FORWARD,
    VIEW_CAMERA_MOVE_BACKWARD,
    VIEW_CAMERA_MOVE_LEFT,
    VIEW_CAMERA_MOVE_RIGHT,
    VIEW_CAMERA_MOVE_UP,
    VIEW_CAMERA_MOVE_DOWN,

    VIEW_CAMERA_TURN_UP,
    VIEW_CAMERA_TURN_DOWN,
    VIEW_CAMERA_TURN_LEFT,
    VIEW_CAMERA_TURN_RIGHT,

    ROTATE_UP,
    ROTATE_DOWN,
    ROTATE_X,
    ROTATE_X_WITH,
    ROTATE_LEFT,
    ROTATE_RIGHT,
    ROTATE_Y,
    ROTATE_Y_WITH,

    TRANSLATE_UP,
    TRANSLATE_DOWN,
    TRANSLATE_LEFT,
    TRANSLATE_RIGHT,
    TRANSLATE_IN,
    TRANSLATE_OUT,
    TRANSLATE_X_WITH,
    TRANSLATE_Y_WITH,

    SCALE_DOWN,
    SCALE_UP,
    SCALE_UP_WITH,
    SCALE_DOWN_WITH,

    SET_TREE,

    SET_ACTIVE_DOCUMENT,

    SPACE_RESET_TRANSFORM,

    SET_VIEW_SIZE,
    SET_SPACE_SIZE,

    UPDATE_SPACE_TREE_PAGE,

    SpaceState,
    SpaceActionsType,
} from './types';

import {
    setSpaceLoading,
    setAnimatedTransform,
    setSpaceLocation,

    viewCameraMoveForward,
    viewCameraMoveBackward,
    viewCameraMoveLeft,
    viewCameraMoveRight,
    viewCameraMoveUp,
    viewCameraMoveDown,

    viewCameraTurnUp,
    viewCameraTurnDown,
    viewCameraTurnLeft,
    viewCameraTurnRight,

    rotateUp,
    rotateDown,
    rotateX,
    rotateXWith,
    rotateLeft,
    rotateRight,
    rotateY,
    rotateYWith,

    translateUp,
    translateDown,
    translateLeft,
    translateRight,
    translateIn,
    translateOut,
    translateXWith,
    translateYWith,

    scaleUp,
    scaleDown,
    scaleUpWith,
    scaleDownWith,

    setTree,
    setActiveDocument,

    spaceResetTransform,

    setViewSize,
    setSpaceSize,

    updateSpaceTreePage,
} from './resolvers';



const initialState: SpaceState = {
    loading: true,
    animatedTransform: false,
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    tree: [],
    activeDocumentID: '',
    camera: {
        x: 0,
        y: 0,
        z: 0,
    },
    viewSize: {
        width: window ? window.innerWidth : 1440,
        height: window ? window.innerHeight : 800,
    },
    spaceSize: {
        width: window ? window.innerWidth : 1440,
        height: window ? window.innerHeight : 800,
        depth: 0,
        topCorner: {
            x: 0,
            y: 0,
            z: 0,
        },
    },
};

const spaceReducer = (
    state: SpaceState = initialState,
    action: SpaceActionsType,
): SpaceState => {
    switch(action.type) {
        case SET_SPACE_LOADING:
            return setSpaceLoading(state, action);
        case SET_ANIMATED_TRANSFORM:
            return setAnimatedTransform(state, action);
        case SET_SPACE_LOCATION:
            return setSpaceLocation(state, action);

        case VIEW_CAMERA_MOVE_FORWARD:
            return viewCameraMoveForward(state);
        case VIEW_CAMERA_MOVE_BACKWARD:
            return viewCameraMoveBackward(state);
        case VIEW_CAMERA_MOVE_LEFT:
            return viewCameraMoveLeft(state);
        case VIEW_CAMERA_MOVE_RIGHT:
            return viewCameraMoveRight(state);
        case VIEW_CAMERA_MOVE_UP:
            return viewCameraMoveUp(state);
        case VIEW_CAMERA_MOVE_DOWN:
            return viewCameraMoveDown(state);

        case VIEW_CAMERA_TURN_UP:
            return viewCameraTurnUp(state);
        case VIEW_CAMERA_TURN_DOWN:
            return viewCameraTurnDown(state);
        case VIEW_CAMERA_TURN_LEFT:
            return viewCameraTurnLeft(state);
        case VIEW_CAMERA_TURN_RIGHT:
            return viewCameraTurnRight(state);

        case ROTATE_UP:
            return rotateUp(state);
        case ROTATE_DOWN:
            return rotateDown(state);
        case ROTATE_X:
            return rotateX(state, action);
        case ROTATE_X_WITH:
            return rotateXWith(state, action);
        case ROTATE_LEFT:
            return rotateLeft(state);
        case ROTATE_RIGHT:
            return rotateRight(state);
        case ROTATE_Y:
            return rotateY(state, action);
        case ROTATE_Y_WITH:
            return rotateYWith(state, action);

        case TRANSLATE_UP:
            return translateUp(state);
        case TRANSLATE_DOWN:
            return translateDown(state);
        case TRANSLATE_LEFT:
            return translateLeft(state);
        case TRANSLATE_RIGHT:
            return translateRight(state);
        case TRANSLATE_IN:
            return translateIn(state);
        case TRANSLATE_OUT:
            return translateOut(state);
        case TRANSLATE_X_WITH:
            return translateXWith(state, action);
        case TRANSLATE_Y_WITH:
            return translateYWith(state, action);

        case SCALE_UP:
            return scaleUp(state);
        case SCALE_DOWN:
            return scaleDown(state);
        case SCALE_UP_WITH:
            return scaleUpWith(state, action);
        case SCALE_DOWN_WITH:
            return scaleDownWith(state, action);

        case SET_TREE:
            return setTree(state, action);
        case SET_ACTIVE_DOCUMENT:
            return setActiveDocument(state, action);
        case SPACE_RESET_TRANSFORM:
            return spaceResetTransform(state);
        case SET_VIEW_SIZE:
            return setViewSize(state, action);
        case SET_SPACE_SIZE:
            return setSpaceSize(state, action);
        case UPDATE_SPACE_TREE_PAGE:
            return updateSpaceTreePage(state, action);
        default:
            return {
                ...state,
            };
    }
}


export default spaceReducer;
