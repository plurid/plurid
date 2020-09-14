import * as Types from './types';

import initialState from './initial';

import * as resolvers from './resolvers';



const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case Types.SHORTCUTS_SET_GLOBAL_SHORTCUTS:
            return resolvers.setGlobalShortcuts(state);
        case Types.SHORTCUTS_UNSET_GLOBAL_SHORTCUTS:
            return resolvers.unsetGlobalShortcuts(state);
        default:
            return {
                ...state,
            };
    }
}


export default reducer;
