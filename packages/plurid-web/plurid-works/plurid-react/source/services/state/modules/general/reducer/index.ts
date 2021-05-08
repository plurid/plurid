// #region imports
    // #region external
    import * as Types from '../types';

    import initialState from '../initial';

    import * as resolvers from '../resolvers';
    // #endregion external
// #endregion imports



// #region module
const reducer = (
    state: Types.State = initialState,
    action: Types.Actions,
): Types.State => {
    // switch(action.type) {
    //     default:
    //         return {
    //             ...state,
    //         };
    // }
    return {
        ...state,
    };
}
// #endregion module



// #region exports
export default reducer;
// #endregion exports
