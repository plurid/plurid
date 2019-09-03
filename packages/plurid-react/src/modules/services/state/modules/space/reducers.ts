import {
    SCALE_STEP,
    SCALE_LOWER_LIMIT,
    SCALE_UPPER_LIMIT,
} from '../../../../data/constants/space';

import {
    SCALE_DOWN,
    SCALE_UP,
    SpaceState,
    SpaceActionsType,
} from './types';



const initialState: SpaceState = {
    scale: 1,
}

const spaceReducer = (
    state: SpaceState = initialState,
    action: SpaceActionsType,
): SpaceState => {
    switch(action.type) {
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
