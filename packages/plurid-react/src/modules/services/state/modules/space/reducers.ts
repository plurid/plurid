import {
    ROTATION_STEP,
    SCALE_STEP,
    SCALE_LOWER_LIMIT,
    SCALE_UPPER_LIMIT,
} from '../../../../data/constants/space';

import {
    ROTATE_UP,
    ROTATE_DOWN,
    ROTATE_LEFT,
    ROTATE_RIGHT,
    // TRANSLATE_UP,
    // TRANSLATE_DOWN,
    // TRANSLATE_LEFT,
    // TRANSLATE_RIGHT,
    SCALE_DOWN,
    SCALE_UP,
    SpaceState,
    SpaceActionsType,
} from './types';



const initialState: SpaceState = {
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
}

const spaceReducer = (
    state: SpaceState = initialState,
    action: SpaceActionsType,
): SpaceState => {
    switch(action.type) {
        case ROTATE_UP:
            {
                const rotationX = state.rotationX + ROTATION_STEP;
                return { ...state, rotationX };
            }
        case ROTATE_DOWN:
            {
                const rotationX = state.rotationX - ROTATION_STEP;
                return { ...state, rotationX };
            }
        case ROTATE_LEFT:
            {
                const rotationY = state.rotationY + ROTATION_STEP;
                return { ...state, rotationY };
            }
        case ROTATE_RIGHT:
            {
                const rotationY = state.rotationY - ROTATION_STEP;
                return { ...state, rotationY };
            }
        case SCALE_UP:
            {
                const computedScale = state.scale + SCALE_STEP;
                const scale = computedScale < SCALE_UPPER_LIMIT
                    ? computedScale
                    : SCALE_UPPER_LIMIT;
                return { ...state, scale };
            }
        case SCALE_DOWN:
            {
                const computedScale = state.scale - SCALE_STEP;
                const scale = computedScale > SCALE_LOWER_LIMIT
                    ? computedScale
                    : SCALE_LOWER_LIMIT;
                return { ...state, scale };
            }
        default:
            return state;
    }
}


export default spaceReducer;
