import {
    createStore,
    applyMiddleware,
} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';



export type AppState = ReturnType<typeof rootReducer>;

const store = (preloadedState: AppState | {}) => createStore(
    rootReducer,
    preloadedState,
    applyMiddleware(
        thunk,
    ),
);


export default store;
