// #region imports
    // #region libraries
    import {
        createStore,
        applyMiddleware,
    } from 'redux';

    import thunk from 'redux-thunk';
    // #endregion libraries


    // #region external
    import reducers from '../reducers';
    // #endregion external
// #endregion imports



// #region module
const store = (
    preloadedState,
) => {
    const _store = createStore(
        reducers,
        preloadedState,
        applyMiddleware(
            thunk,
        ),
    );

    return _store;
}
// #endregion module



// #region exports
export default store;
// #endregion exports
