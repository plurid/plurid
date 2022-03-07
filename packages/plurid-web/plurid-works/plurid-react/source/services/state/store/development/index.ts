// #region imports
    // #region libraries
    import {
        createStore,
        applyMiddleware,
        Store,
    } from 'redux';

    import thunk from 'redux-thunk';
    // #endregion libraries


    // #region external
    import environment from '~services/utilities/environment';
    // #endregion external


    // #region internal
    import rootReducer from '../reducers';
    // #endregion internal
// #endregion imports



// #region module
let composeWithDevTools: any;
if (!environment.production) {
    try {
        const reduxDevTools = require('@redux-devtools/extension');
        composeWithDevTools = reduxDevTools.composeWithDevTools;
    } catch (error) {
        composeWithDevTools = undefined;
    }
}

export type AppState = ReturnType<typeof rootReducer>;

const store: (
    preloadedState: AppState | {},
) => Store<AppState> = (
    preloadedState: AppState | {},
) => {
    const middleware = [
        thunk,
    ];

    const createdStore = createStore(
        rootReducer,
        preloadedState,
        composeWithDevTools
            ? composeWithDevTools(applyMiddleware(...middleware))
            : applyMiddleware(...middleware),
    );

    return createdStore;
}
// #endregion module



// #region exports
export default store;
// #endregion exports
