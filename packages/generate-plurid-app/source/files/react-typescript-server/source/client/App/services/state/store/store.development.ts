import {
    createStore,
    applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';

import {
    composeWithDevTools,
} from 'redux-devtools-extension';

import rootReducer from './reducers';



export type AppState = ReturnType<typeof rootReducer>;

const store = (preloadedState: any) => {
    const middleware = [ thunk ];

    // const localState = localStorage.loadState();

    // const persistedState = {
    //     themes: localState?.themes,
    // };

    const _store = createStore(
        rootReducer,
        preloadedState,
        // persistedState || preloadedState,
        composeWithDevTools(
            applyMiddleware(...middleware),
        ),
    );

    // _store.subscribe(
    //     () => {
    //         const localState = localStorage.loadState();
    //         localStorage.saveState({
    //             ...localState,
    //             themes: _store.getState().themes,
    //         });
    //     },
    // );

    return _store;
}


export default store;
