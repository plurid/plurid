import {
    SCALE_UP,
    ScaleUpAction,
    SCALE_DOWN,
    ScaleDownAction,
} from './types'



export const scaleUp = (): ScaleUpAction => {
    return {
        type: SCALE_UP,
    };
}


export const scaleDown = (): ScaleDownAction => {
    return {
        type: SCALE_DOWN,
    };
}
