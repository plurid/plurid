// #region imports
    // #region libraries
    import {
        createStore,
        applyMiddleware,
        Store,
    } from 'redux';
    import thunk from 'redux-thunk';
    // #endregion libraries


    // #region internal
    import rootReducer from './reducers';
    // #endregion internal
// #endregion imports



// #region module
export type AppState = ReturnType<typeof rootReducer>;

const store: (preloadedState: AppState | {}) => Store<AppState> = (preloadedState: AppState | {}) => createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(
        thunk,
    ),
);
// #endregion module



// #region exports
export default store;
// #endregion exports
