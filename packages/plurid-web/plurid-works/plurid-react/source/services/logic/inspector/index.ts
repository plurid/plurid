// #region imports
    // #region libraries
    import {
        PluridInspection,
        PluridInspectionPlane,
        PluridInspectorRegistry,
        PluridStateSpace,
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';
    import {
        getCulledSets,
        planeCullingState,
    } from '~services/state/modules/space/selectors';
    // #endregion external
// #endregion imports



// #region module
/** One registry per application: the planes and the gesture layer write it, `api.inspect()` reads it. */
export const createInspector = (): PluridInspectorRegistry => ({
    enabled: false,
    renders: new Map(),
    gesture: null,
    dispatches: 0,
});

/** A plane rendered (its effect after the commit): one more render, only while the inspector is on. */
export const recordRender = (
    inspector: PluridInspectorRegistry | undefined,
    planeID: string,
): void => {
    if (!inspector?.enabled) {
        return;
    }
    inspector.renders.set(planeID, (inspector.renders.get(planeID) ?? 0) + 1);
};

/** The culling pass's counts per tier — the one reading for `inspect()`, the handle and the `culling` event. */
export const cullingCounts = (
    space: PluridStateSpace,
): { hidden: number; frozen: number; detached: number } => ({
    hidden: space.culled.hidden.length,
    frozen: space.culled.frozen.length,
    detached: space.culled.detached.length,
});

/**
 * THE DIAGNOSTIC SURFACE: everything the store knows about the planes, the camera and the culling,
 * plus the registry's counters — one plain object, safe to serialize, never a live reference.
 */
export const buildInspection = (
    state: AppState,
    inspector: PluridInspectorRegistry | undefined,
): PluridInspection => {
    const space = state.space;
    const sets = getCulledSets(state);
    const planes: PluridInspectionPlane[] = [];
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            if (node.show === false) {
                continue;
            }
            planes.push({
                planeID: node.planeID,
                parentPlaneID: node.parentPlaneID,
                sourceID: node.sourceID,
                route: node.route,
                location: { ...node.location },
                width: node.width,
                height: node.height,
                sizeMode: node.sizeMode ?? 'measured',
                manuallyPositioned: !!node.manuallyPositioned,
                spawnedByLinkID: node.spawnedByLinkID,
                culled: planeCullingState(sets, node.planeID),
                renders: inspector?.renders.get(node.planeID) ?? 0,
            });
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(space.tree);
    const culling = cullingCounts(space);
    return {
        camera: { ...space.camera },
        motion: space.motion,
        gesture: inspector?.gesture ?? null,
        view: { ...space.viewSize },
        counts: {
            dispatches: inspector?.dispatches ?? 0,
            renders: planes.reduce((sum, plane) => sum + plane.renders, 0),
            shown: planes.length,
            mounted: planes.length - culling.detached,
            ...culling,
        },
        planes,
        links: [...space.links],
        inspector: !!inspector?.enabled,
    };
};
// #endregion module
