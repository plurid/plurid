import {
    createStore,
    applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';

import rootReducer from './reducers';

import environment from '../../utilities/environment';



let composeWithDevTools: any;
if (!environment.production) {
    const reduxDevTools = require('redux-devtools-extension');
    composeWithDevTools = reduxDevTools.composeWithDevTools;
}

export type AppState = ReturnType<typeof rootReducer>;

const store = (preloadedState: AppState | {}) => {
    const middleware = [ thunk ];

    const _store = createStore(
        rootReducer,
        preloadedState,
        composeWithDevTools
            ? composeWithDevTools(applyMiddleware(...middleware))
            : applyMiddleware(...middleware),
    );

    return _store;
}


export default store;
