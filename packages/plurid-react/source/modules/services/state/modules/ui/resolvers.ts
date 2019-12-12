import {
    UIState,

    SetUIToolbarScrollPositionAction,
} from './types';



export const setUIToolbarScrollPosition = (
    state: UIState,
    action: SetUIToolbarScrollPositionAction,
): UIState => {
    return {
        ...state,
        toolbarScrollPosition: action.payload,
    };
}
