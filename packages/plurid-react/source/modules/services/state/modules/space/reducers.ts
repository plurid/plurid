import {
    ROTATION_STEP,
    TRANSLATION_STEP,
    SCALE_STEP,
    SCALE_LOWER_LIMIT,
    SCALE_UPPER_LIMIT,
} from '@plurid/plurid-data';

import {
    SET_SPACE_LOADING,

    SET_ANIMATED_TRANSFORM,

    TOGGLE_FIRST_PERSON,

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
    TRANSLATE_X_WITH,
    TRANSLATE_Y_WITH,

    SCALE_DOWN,
    SCALE_UP,
    SCALE_UP_WITH,
    SCALE_DOWN_WITH,

    SET_TREE,

    TOGGLE_ROTATION_LOCKED,
    TOGGLE_TRANSLATION_LOCKED,
    TOGGLE_SCALE_LOCKED,

    SET_ACTIVE_DOCUMENT,

    SpaceState,
    SpaceActionsType,
} from './types';



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
    rotationLocked: false,
    translationLocked: false,
    scaleLocked: false,
    activeDocumentID: '',
    firstPerson: false,
    camera: {
        x: 0,
        y: 0,
        z: 0,
    },
}

const spaceReducer = (
    state: SpaceState = initialState,
    action: SpaceActionsType,
): SpaceState => {
    switch(action.type) {
        case SET_SPACE_LOADING:
            {
                return {
                    ...state,
                    loading: action.payload,
                };
            }
        case SET_ANIMATED_TRANSFORM:
            {
                return {
                    ...state,
                    animatedTransform: action.payload,
                };
            }
        case TOGGLE_FIRST_PERSON:
            {
                return {
                    ...state,
                    firstPerson: !state.firstPerson,
                };
            }
        case SET_SPACE_LOCATION:
            {
                return {
                    ...state,
                    ...action.payload,
                };
            }


        case VIEW_CAMERA_MOVE_FORWARD:
            {
                const translationZ = state.translationZ + TRANSLATION_STEP;
                return {
                    ...state,
                    translationZ,
                };
            }
        case VIEW_CAMERA_MOVE_BACKWARD:
            {
                const translationZ = state.translationZ - TRANSLATION_STEP;
                return {
                    ...state,
                    translationZ,
                };
            }
        case VIEW_CAMERA_MOVE_LEFT:
            {
                const translationX = state.translationX + TRANSLATION_STEP;
                return {
                    ...state,
                    translationX,
                };
            }
        case VIEW_CAMERA_MOVE_RIGHT:
            {
                const translationX = state.translationX - TRANSLATION_STEP;
                return {
                    ...state,
                    translationX,
                };
            }
        case VIEW_CAMERA_MOVE_UP:
            {
                const translationY = state.translationY - TRANSLATION_STEP;
                return {
                    ...state,
                    translationY,
                };
            }
        case VIEW_CAMERA_MOVE_DOWN:
            {
                const translationY = state.translationY + TRANSLATION_STEP;
                return {
                    ...state,
                    translationY,
                };
            }


        case VIEW_CAMERA_TURN_UP:
            {
                return {
                    ...state,
                };
            }
        case VIEW_CAMERA_TURN_DOWN:
            {
                return {
                    ...state,
                };
            }
        case VIEW_CAMERA_TURN_LEFT:
            {
                return {
                    ...state,
                };
            }
        case VIEW_CAMERA_TURN_RIGHT:
            {
                return {
                    ...state,
                };
            }


        case ROTATE_UP:
            {
                const rotationX = (state.rotationX + ROTATION_STEP) % 360;
                return {
                    ...state,
                    rotationX,
                };
            }
        case ROTATE_DOWN:
            {
                const rotationX = (state.rotationX - ROTATION_STEP) % 360;
                return {
                    ...state,
                    rotationX,
                };
            }
        case ROTATE_X:
            {
                return {
                    ...state,
                    rotationX: action.payload,
                };
            }
        case ROTATE_X_WITH:
            {
                const rotationX = state.rotationX + action.payload;
                return {
                    ...state,
                    rotationX,
                };
            }
        case ROTATE_LEFT:
            {
                const rotationY = (state.rotationY + ROTATION_STEP) % 360;
                return {
                    ...state,
                    rotationY,
                };
            }
        case ROTATE_RIGHT:
            {
                const rotationY = (state.rotationY - ROTATION_STEP) % 360;
                return {
                    ...state,
                    rotationY,
                };
            }
        case ROTATE_Y:
            {
                return {
                    ...state,
                    rotationY: action.payload,
                };
            }
        case ROTATE_Y_WITH:
            {
                const rotationY = state.rotationY + action.payload;
                return {
                    ...state,
                    rotationY,
                };
            }
        case TRANSLATE_UP:
            {
                const translationY = state.translationY - TRANSLATION_STEP;
                return {
                    ...state,
                    translationY,
                };
            }
        case TRANSLATE_DOWN:
            {
                const translationY = state.translationY + TRANSLATION_STEP;
                return {
                    ...state,
                    translationY,
                };
            }
        case TRANSLATE_LEFT:
            {
                const translationX = state.translationX - TRANSLATION_STEP;
                return {
                    ...state,
                    translationX,
                };
            }
        case TRANSLATE_RIGHT:
            {
                const translationX = state.translationX + TRANSLATION_STEP;
                return {
                    ...state,
                    translationX,
                };
            }
        case TRANSLATE_X_WITH:
            {
                const translationX = state.translationX + action.payload;
                return {
                    ...state,
                    translationX,
                };
            }
        case TRANSLATE_Y_WITH:
            {
                const translationY = state.translationY + action.payload;
                return {
                    ...state,
                    translationY,
                };
            }
        case SCALE_UP:
            {
                const computedScale = state.scale + SCALE_STEP;
                const scale = computedScale < SCALE_UPPER_LIMIT
                    ? computedScale
                    : SCALE_UPPER_LIMIT;
                return {
                    ...state,
                    scale,
                };
            }
        case SCALE_DOWN:
            {
                const computedScale = state.scale - SCALE_STEP;
                const scale = computedScale > SCALE_LOWER_LIMIT
                    ? computedScale
                    : SCALE_LOWER_LIMIT;
                return {
                    ...state,
                    scale,
                };
            }
        case SCALE_UP_WITH:
            {
                const computedScale = state.scale + Math.abs(action.payload);
                const scale = computedScale < SCALE_UPPER_LIMIT
                    ? computedScale
                    : SCALE_UPPER_LIMIT;

                return {
                    ...state,
                    scale,
                };
            }
        case SCALE_DOWN_WITH:
            {
                const computedScale = state.scale - Math.abs(action.payload);
                const scale = computedScale > SCALE_LOWER_LIMIT
                    ? computedScale
                    : SCALE_LOWER_LIMIT;

                return {
                    ...state,
                    scale,
                };
            }
        case SET_TREE:
            {
                return {
                    ...state,
                    tree: [
                        ...action.payload,
                    ],
                };
            }
        case TOGGLE_ROTATION_LOCKED:
            {
                return {
                    ...state,
                    rotationLocked: !state.rotationLocked,
                    translationLocked: false,
                    scaleLocked: false,
                };
            }
        case TOGGLE_TRANSLATION_LOCKED:
            {
                return {
                    ...state,
                    rotationLocked: false,
                    translationLocked: !state.translationLocked,
                    scaleLocked: false,
                };
            }
        case TOGGLE_SCALE_LOCKED:
            {
                return {
                    ...state,
                    rotationLocked: false,
                    translationLocked: false,
                    scaleLocked: !state.scaleLocked,
                };
            }
        case SET_ACTIVE_DOCUMENT:
            {
                return {
                    ...state,
                    activeDocumentID: action.payload,
                }
            }
        default:
            return {
                ...state,
            };
    }
}


export default spaceReducer;
