import {
    createStore,
    applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers';



const store = (preloadedState) => {
    // const localState = localStorage.loadState();

    // const persistedState = {
    //     themes: localState?.themes,
    // };

    const _store = createStore(
        rootReducer,
        preloadedState,
        // persistedState || preloadedState,
        applyMiddleware(
            thunk,
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
