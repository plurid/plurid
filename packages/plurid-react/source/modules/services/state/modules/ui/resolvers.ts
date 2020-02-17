import * as Types from './types';



export const setUIToolbarScrollPosition = (
    state: Types.State,
    action: Types.SetUIToolbarScrollPositionAction,
): Types.State => {
    return {
        ...state,
        toolbarScrollPosition: action.payload,
    };
}
