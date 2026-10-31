// #region imports
    // #region libraries
    import React, {
        useEffect,
        useRef,
    } from 'react';

    import type {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import type {
        AppState,
    } from '~services/state/store';
    import {
        occludedFor,
        OCCLUSION_QUIET_MS,
    } from '~services/logic/occlusion';
    import {
        planeElementOf,
        pinnedFrameOf,
    } from '~services/logic/input/guard';
    // #endregion external
// #endregion imports



// #region module
export interface UseOcclusionParameters {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    stateRef: React.MutableRefObject<AppState>;
    state: AppState;
    viewElement: React.RefObject<HTMLDivElement>;
}

/**
 * THE OCCLUSION PASS (2026-10-31), AT REST ONLY. The moment the camera moves (a gesture, a fling, a
 * tween, a jump, a wheel's tail) or the roots glide, the faded set is emptied: nothing fades during
 * travel, so motion stays readable, and a plane that no longer occludes is back at once. Once the
 * camera has been still for `OCCLUSION_QUIET_MS` (and after a tree, size, target or configuration
 * change at rest) the pass computes the set against the state then, and writes it only when it
 * changed. A plane that takes the focus (a click into its content, a tab to it) becomes the target.
 */
export const useOcclusion = (
    {
        dispatch,
        stateRef,
        state,
        viewElement,
    }: UseOcclusionParameters,
) => {
    const space = state.space;
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const camera = useRef(space.camera);

    const moving = space.motion !== 'idle' || (space.layoutTransition || 0) > 0;
    const mode = state.configuration.space.occlusion;
    const target = space.occluded?.target ?? '';

    useEffect(() => {
        const current = stateRef.current;
        const moved = camera.current !== space.camera;
        camera.current = space.camera;
        const faded = current.space.occluded?.planeIDs ?? [];
        if ((moving || moved || mode === 'none' || !target) && faded.length > 0) {
            dispatch(actions.space.setOccluded({ target: current.space.occluded.target, planeIDs: [] }));
        }
        if (timer.current !== null) {
            clearTimeout(timer.current);
            timer.current = null;
        }
        if (moving || mode === 'none' || !target) {
            return;
        }
        timer.current = setTimeout(() => {
            timer.current = null;
            const latest = stateRef.current;
            if (latest.space.motion !== 'idle' || (latest.space.layoutTransition || 0) > 0) {
                return;
            }
            const next = occludedFor(latest);
            const now = latest.space.occluded ?? { target: '', planeIDs: [] };
            // written only when it changed: an idle space dispatches nothing
            if (
                now.target !== next.target
                || now.planeIDs.length !== next.planeIDs.length
                || now.planeIDs.some((planeID, index) => planeID !== next.planeIDs[index])
            ) {
                dispatch(actions.space.setOccluded(next));
            }
        }, OCCLUSION_QUIET_MS);
    }, [
        space.camera,
        space.tree,
        space.viewSize,
        moving,
        mode,
        target,
        space.isolatePlane,
    ]);

    useEffect(() => () => {
        if (timer.current !== null) {
            clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);

    // a plane that takes the focus is the one the reader looks at
    useEffect(() => {
        const element = viewElement.current;
        if (!element) {
            return;
        }
        const onFocus = (event: FocusEvent) => {
            if (pinnedFrameOf(event.target)) {
                return;
            }
            const planeID = planeElementOf(event.target)?.getAttribute('data-plurid-plane') || '';
            if (!planeID || planeID === (stateRef.current.space.occluded?.target ?? '')) {
                return;
            }
            dispatch(actions.space.setOcclusionTarget(planeID));
        };
        element.addEventListener('focusin', onFocus);
        return () => {
            element.removeEventListener('focusin', onFocus);
        };
    }, []);
};
// #endregion module



// #region exports
export default useOcclusion;
// #endregion exports
