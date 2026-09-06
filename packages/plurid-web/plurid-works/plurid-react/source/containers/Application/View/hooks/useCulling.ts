// #region imports
    // #region libraries
    import React, {
        useEffect,
        useRef,
    } from 'react';

    import {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import { AppState } from '~services/state/store';

    import {
        space as spaceEngine,
        interaction,
    } from '~services/engine';

    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    // #endregion external
// #endregion imports



// #region module
const cameraEngine = interaction.camera;

export interface UseCullingParameters {
    dispatch: ThunkDispatch<{}, {}, AnyAction>;
    stateRef: React.MutableRefObject<AppState>;
    /** The camera matrix: the signal that a frame was committed. */
    transform: string;
    tree: TreePlane[];
    viewElement: React.RefObject<HTMLDivElement>;
}

/** At most one culling pass per this many ms, per committed frame. */
const CULLING_INTERVAL = 100;


/**
 * The culling + depth-cue pass: at most every 100 ms after a camera commit or a tree change,
 * decide which planes stop painting (`state.space.culled.hidden`), which are frozen
 * (`culled.frozen`), and — when `elements.plane.depthFade` is on — write each plane's depth cue as
 * CSS variables on its element (no store churn for a per-frame visual). Off unless
 * `space.culling.enabled`; the active, selected, isolated and focused planes are never culled.
 */
export const useCulling = (
    {
        dispatch,
        stateRef,
        transform,
        tree,
        viewElement,
    }: UseCullingParameters,
) => {
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const last = useRef(0);


    useEffect(() => {
        const run = () => {
            timer.current = null;
            last.current = Date.now();

            const state = stateRef.current;
            const configuration = state.configuration;
            const culling = configuration.space.culling;
            const depthFade = configuration.elements.plane.depthFade;
            const spaceState = state.space;
            const enabled = !!culling?.enabled;
            const fadeEnabled = !!depthFade?.enabled;
            if (!enabled && !fadeEnabled) {
                if (spaceState.culled.hidden.length > 0 || spaceState.culled.frozen.length > 0) {
                    dispatch(actions.space.setCulled({ hidden: [], frozen: [] }));
                }
                return;
            }

            const fallback = resolvePlaneFallbackSize(configuration, spaceState.viewSize);
            const planes: { id: string; location: TreePlane['location']; width: number; height: number }[] = [];
            const walk = (nodes: TreePlane[]) => {
                for (const node of nodes) {
                    if (node.show === false) {
                        continue;
                    }
                    planes.push({
                        id: node.planeID,
                        location: node.location,
                        width: node.width || fallback.width,
                        height: node.height || fallback.height,
                    });
                    if (node.children) {
                        walk(node.children);
                    }
                }
            };
            walk(spaceState.tree);

            const exceptions = new Set<string>([
                spaceState.activePlaneID,
                spaceState.isolatePlane,
                ...spaceState.selectedPlaneIDs,
            ].filter(Boolean));
            const focused = typeof document !== 'undefined'
                ? document.activeElement?.closest?.('[data-plurid-plane]')?.getAttribute('data-plurid-plane')
                : undefined;
            if (focused) {
                exceptions.add(focused);
            }

            if (!enabled && !fadeEnabled) {
                return;
            }

            const previous = {
                hidden: spaceState.culled.hidden,
                frozen: spaceState.culled.frozen,
                depths: {},
            };
            const result = spaceEngine.view.cullPlanes(
                planes,
                spaceState.camera,
                spaceState.viewSize,
                {
                    distance: culling?.distance,
                    hysteresis: culling?.hysteresis,
                    frustumMargin: culling?.frustumMargin,
                    freezeDistance: culling?.freezeDistance,
                },
                previous,
                exceptions,
            );

            if (enabled) {
                if (!spaceEngine.view.sameCulling(previous, result)) {
                    dispatch(actions.space.setCulled({
                        hidden: result.hidden,
                        frozen: result.frozen,
                    }));
                }
            } else if (spaceState.culled.hidden.length > 0 || spaceState.culled.frozen.length > 0) {
                dispatch(actions.space.setCulled({ hidden: [], frozen: [] }));
            }

            if (fadeEnabled && viewElement.current) {
                const start = depthFade?.start ?? 800;
                const end = Math.max(start + 1, depthFade?.end ?? 2500);
                const minimum = depthFade?.minOpacity ?? 0.35;
                const blur = depthFade?.blur ?? 0;
                const elements = viewElement.current.querySelectorAll<HTMLElement>('[data-plurid-plane]');
                elements.forEach((element) => {
                    const id = element.getAttribute('data-plurid-plane') || '';
                    const depth = result.depths[id];
                    if (depth === undefined) {
                        return;
                    }
                    const t = Math.min(1, Math.max(0, (depth - start) / (end - start)));
                    const fade = 1 - t * (1 - minimum);
                    element.style.setProperty('--plurid-plane-depth', String(Math.round(depth)));
                    element.style.setProperty('--plurid-plane-fade', fade.toFixed(3));
                    element.style.setProperty('--plurid-plane-blur', (t * blur).toFixed(2) + 'px');
                });
            }
        };

        const elapsed = Date.now() - last.current;
        if (timer.current !== null) {
            return;
        }
        timer.current = setTimeout(run, Math.max(0, CULLING_INTERVAL - elapsed));

        return () => {
            if (timer.current !== null) {
                clearTimeout(timer.current);
                timer.current = null;
            }
        };
    }, [
        transform,
        tree,
    ]);
}
// #endregion module



// #region exports
export default useCulling;
// #endregion exports
