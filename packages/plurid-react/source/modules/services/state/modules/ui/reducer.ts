import * as Types from './types';

import initialState from './initial';

import * as resolvers from './resolvers';



const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case Types.SET_UI_TOOLBAR_SCROLL_POSITION:
            return resolvers.setUIToolbarScrollPosition(state, action);
        default:
            return {
                ...state,
            };
    }
}


export default reducer;
