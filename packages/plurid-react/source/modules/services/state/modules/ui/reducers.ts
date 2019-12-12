import {
    SET_UI_TOOLBAR_SCROLL_POSITION,

    UIState,
    UIActionsType,
} from './types';

import {
    setUIToolbarScrollPosition,
} from './resolvers';



const initialState: UIState = {
    toolbarScrollPosition: 0,
};

const uiReducer = (
    state: UIState = initialState,
    action: UIActionsType,
): UIState => {
    switch(action.type) {
        case SET_UI_TOOLBAR_SCROLL_POSITION:
            return setUIToolbarScrollPosition(state, action);
        default:
            return {
                ...state,
            };
    }
}


export default uiReducer;
