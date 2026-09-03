// #region imports
    // #region libraries
    import {
        combineReducers,
        Reducer,
        UnknownAction,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import modules from '~services/state/modules';
    // #endregion external
// #endregion imports



// #region module
const combined = combineReducers({
    configuration: modules.configuration.reducer,
    shortcuts: modules.shortcuts.reducer,
    space: modules.space.reducer,
    themes: modules.themes.reducer,
    ui: modules.ui.reducer,
});

export type AppState = ReturnType<typeof combined>;

export const SET_STATE = 'SET_STATE';

export interface SetStateAction {
    type: typeof SET_STATE;
    payload: Partial<AppState>;
}


/**
 * `SET_STATE`: `PluridApplication` recomputed the store from changed props. The host-owned slices
 * (`configuration`, `themes`, `shortcuts`) are replaced; the live `space` keeps everything the
 * user did (camera, tree, selection, history…) and takes only what the props own: the `view` and
 * the configuration-derived camera limits. (This action was dispatched for years and handled by
 * no reducer — prop changes never reached the store.)
 */
const applyState = (
    state: AppState,
    payload: Partial<AppState>,
): AppState => {
    let next = state;

    if (payload.configuration && payload.configuration !== state.configuration) {
        next = { ...next, configuration: payload.configuration };
    }
    if (payload.themes && payload.themes !== state.themes) {
        next = { ...next, themes: payload.themes };
    }
    if (payload.shortcuts && payload.shortcuts !== state.shortcuts) {
        next = { ...next, shortcuts: payload.shortcuts };
    }

    if (payload.space) {
        const space = state.space;
        const view = payload.space.view ?? space.view;
        const cameraLimits = payload.space.cameraLimits ?? space.cameraLimits;
        if (view !== space.view || cameraLimits !== space.cameraLimits) {
            next = {
                ...next,
                space: {
                    ...space,
                    view,
                    cameraLimits,
                },
            };
        }
    }

    return next;
};


// The preloaded state may be partial (the store factories accept `AppState | {}`); `combined`
// fills the slices in on the first action, so `SET_STATE` only ever sees a full state.
const reducer: Reducer<AppState, UnknownAction, Partial<AppState> | {}> = (
    state,
    action,
) => {
    if (action && action.type === SET_STATE && state && (action as unknown as SetStateAction).payload) {
        return applyState(state as AppState, (action as unknown as SetStateAction).payload);
    }
    return combined(state as AppState | undefined, action);
};
// #endregion module



// #region exports

export default reducer;
// #endregion exports
