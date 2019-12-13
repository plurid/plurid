import {
    createStore,
    applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension/logOnlyInProduction';
import rootReducer from './reducers';



export type AppState = ReturnType<typeof rootReducer>;

const store = (preloadedState: AppState | {}) => {
    const middleware = [ thunk ];

    const _store = createStore(
        rootReducer,
        preloadedState,
        composeWithDevTools(
            applyMiddleware(...middleware),
        ),
    );

    return _store;
}


export default store;
