import * as Types from './types';

import initialState from './initial';

import * as resolvers from './resolvers';



const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    switch(action.type) {
        case Types.DATA_SET_UNIVERSES:
            return resolvers.setUniverses(state, action);
        case Types.DATA_SET_PLANE_SOURCES:
            return resolvers.setPlaneSources(state, action);
        default:
            return {
                ...state,
            };
    }
}


export default reducer;
