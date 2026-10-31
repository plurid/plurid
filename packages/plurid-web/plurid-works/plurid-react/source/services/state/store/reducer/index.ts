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
    import type { PluridThunkExtra } from '~services/state/extra';
    import { allowsPin, clearRefusedPins } from '~services/logic/pinned/policy';
    import { pruneStacks } from '~services/logic/arrangement/stacks';
    import type { TreePlane } from '@plurid/plurid-data';
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


export const RESTORE_STATE = 'RESTORE_STATE';

/**
 * `RESTORE_STATE`: a SAVED state lands on a running application — after a hydration, which must
 * render the server's state first. Unlike `SET_STATE` it takes what the reader made (the camera, the
 * tree, the selection, the isolation, the bookmarks, the history), keeping only what this page has
 * measured (the view size, the culling pass). The camera's matrix is re-derived by the caller for
 * the measured view.
 */
const restoreState = (
    state: AppState,
    payload: Partial<AppState>,
): AppState => ({
    ...state,
    ...(payload.configuration ? { configuration: payload.configuration } : {}),
    ...(payload.themes ? { themes: payload.themes } : {}),
    ...(payload.shortcuts ? { shortcuts: payload.shortcuts } : {}),
    ...(payload.space
        ? {
            space: {
                ...payload.space,
                viewSize: state.space.viewSize,
                culled: state.space.culled,
            },
        }
        : {}),
});


// The preloaded state may be partial (the store factories accept `AppState | {}`); `combined`
// fills the slices in on the first action, so `SET_STATE` only ever sees a full state.
const baseReducer: Reducer<AppState, UnknownAction, Partial<AppState> | {}> = (
    state,
    action,
) => {
    if (action && action.type === SET_STATE && state && (action as unknown as SetStateAction).payload) {
        return applyState(state as AppState, (action as unknown as SetStateAction).payload);
    }
    if (action && action.type === RESTORE_STATE && state && (action as unknown as SetStateAction).payload) {
        return restoreState(state as AppState, (action as unknown as SetStateAction).payload);
    }
    return combined(state as AppState | undefined, action);
};
/**
 * Pin policies and stack references are invariants of the committed tree, including restored
 * snapshots. Validate before subscribers render it, not through a second corrective dispatch.
 * Cache the pinned instances by tree identity so camera-only changes visit no unrelated planes.
 */
export const createReducer = (extra?: PluridThunkExtra): typeof baseReducer => {
    let seen: TreePlane[] | undefined;
    let pinned: TreePlane[] = [];
    return (state, action) => {
        let next = baseReducer(state, action);
        if (next.space.tree !== seen) {
            seen = next.space.tree;
            pinned = [];
            const visit = (nodes: TreePlane[]) => {
                for (const node of nodes) {
                    if (node.pinned) pinned.push(node);
                    visit(node.children || []);
                }
            };
            visit(seen);
        }
        const refused = new Set(pinned.filter((plane) => !allowsPin(plane, extra?.registeredPlane)).map((plane) => plane.planeID));
        if (refused.size) {
            next = { ...next, space: { ...next.space, tree: clearRefusedPins(next.space.tree, refused) } };
            seen = next.space.tree;
            pinned = pinned.filter((plane) => !refused.has(plane.planeID));
        }
        const before = state as Partial<AppState> | undefined;
        if (next.space.tree !== before?.space?.tree || next.space.stacks !== before?.space?.stacks) {
            const stacks = pruneStacks(next.space.stacks, next.space.tree);
            if (stacks !== next.space.stacks) next = { ...next, space: { ...next.space, stacks } };
        }
        return next;
    };
};

const reducer = createReducer();
// #endregion module



// #region exports

export default reducer;
// #endregion exports
