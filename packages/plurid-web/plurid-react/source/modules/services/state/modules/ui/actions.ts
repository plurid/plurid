import * as Types from './types';



export const setUIToolbarScrollPosition = (
    value: number,
): Types.SetUIToolbarScrollPositionAction => {
    return {
        type: Types.SET_UI_TOOLBAR_SCROLL_POSITION,
        payload: value,
    };
}
