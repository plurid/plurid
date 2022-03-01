// #region imports
    // #region libraries
    import {
        createStore,
        applyMiddleware,
    } from 'redux';

    import thunk from 'redux-thunk';

    import {
        composeWithDevTools,
    } from 'redux-devtools-extension';
    // #endregion libraries


    // #region external
    import reducers from '../reducers';
    // #endregion external
// #endregion imports



// #region module
export type AppState = ReturnType<typeof reducers>;

const store = (
    preloadedState: any,
) => {
    const middleware = [
        thunk,
    ];

    const _store: any = createStore(
        reducers,
        preloadedState,
        composeWithDevTools(
            applyMiddleware(...middleware),
        ),
    );

    return _store;
}
// #endregion module



// #region exports
export default store;
// #endregion exports
