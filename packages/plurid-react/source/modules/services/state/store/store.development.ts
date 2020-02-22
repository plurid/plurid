import {
    createStore,
    applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';



let devtools: any;

const loadDevTools = async () => {
    devtools = await import('redux-devtools-extension/logOnlyInProduction');
}


export type AppState = ReturnType<typeof rootReducer>;

const store = (preloadedState: AppState | {}) => {
    const middleware = [ thunk ];

    loadDevTools();

    const _store = createStore(
        rootReducer,
        preloadedState,
        devtools
            ? devtools.composeWithDevTools(applyMiddleware(...middleware))
            : applyMiddleware(...middleware),
    );

    return _store;
}


export default store;
