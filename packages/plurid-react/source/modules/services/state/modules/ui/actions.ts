import {
    SET_UI_TOOLBAR_SCROLL_POSITION,
    SetUIToolbarScrollPositionAction,
} from './types';



export const setUIToolbarScrollPosition = (
    value: number,
): SetUIToolbarScrollPositionAction => {
    return {
        type: SET_UI_TOOLBAR_SCROLL_POSITION,
        payload: value,
    };
}
