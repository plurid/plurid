import {
    createStore,
    applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';



// let devtools: any;

// const loadDevTools = async () => {
//     devtools = await import('redux-devtools-extension/logOnlyInProduction');
// }

export type AppState = ReturnType<typeof rootReducer>;

const store = (preloadedState: AppState | {}) => {
    const middleware = [ thunk ];

    const composeEnhancers = typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(...middleware)
        : applyMiddleware(...middleware);

    const _store = createStore(
        rootReducer,
        preloadedState,
        composeEnhancers,
    );

    return _store;
}


export default store;
