// #region imports
    // #region libraries
    import type {
        TreePlane,
        PluridOccluded,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import type {
        AppState,
    } from '~services/state/store';
    import {
        interaction,
    } from '~services/engine';
    import {
        planeGeometry,
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    import {
        getDockedLineage,
    } from '~services/state/modules/space/selectors';
    // #endregion external
// #endregion imports



// #region module
/**
 * OCCLUDED PLANES FADE (2026-10-31). When the camera rests on a plane (the occlusion TARGET: the
 * plane a frame, a pair, a dock or an anchor names, a tour's stop, a plane that takes the focus),
 * the planes whose part nearer the camera covers more than `OCCLUSION_THRESHOLD` of the target's
 * drawn area fade to `OCCLUDED_OPACITY` and let the pointer through (`interaction.camera
 * .occludingPlanes`, a depth test over the overlap). The View's `useOcclusion` runs this at rest
 * only: the set is emptied the moment the camera moves, and computed again once it has been still
 * for `OCCLUSION_QUIET_MS`.
 */

/** The opacity of a plane faded in front of the target. */
export const OCCLUDED_OPACITY = 0.1;
/** The fade, ms (none under reduced motion). */
export const OCCLUSION_FADE_MS = 180;
/** How long the camera stays still before the pass runs, ms. */
export const OCCLUSION_QUIET_MS = 120;

const NONE: string[] = [];

/** The planes rendered now: shown, with every plane they hang from shown. */
const shownPlanes = (
    tree: TreePlane[],
    into: TreePlane[] = [],
): TreePlane[] => {
    for (const node of tree || []) {
        if (node.show === false) {
            continue;
        }
        into.push(node);
        shownPlanes(node.children || [], into);
    }
    return into;
};

/**
 * THE PLANES THAT FADE NOW, for the state as it is: none with `space.occlusion: 'none'`, with no
 * target, a target that is not shown or is pinned, or an isolated plane; never a pinned plane, a
 * plane set aside by the docked page, or the target.
 */
export const occludedFor = (
    state: AppState,
): PluridOccluded => {
    const space = state.space;
    const target = space.occluded?.target ?? '';
    const none = { target, planeIDs: NONE };
    if (!target || state.configuration.space.occlusion === 'none' || space.isolatePlane) {
        return none;
    }
    const planes = shownPlanes(space.tree);
    const front = planes.find((plane) => plane.planeID === target);
    if (!front || front.pinned) {
        return none;
    }
    const lineage = getDockedLineage(state);
    const fallback = resolvePlaneFallbackSize(state.configuration, space.viewSize);
    const candidates = planes
        .filter((plane) => plane.planeID !== target
            && !plane.pinned
            && (lineage.size === 0 || lineage.has(plane.planeID)))
        .map((plane) => ({ planeID: plane.planeID, ...planeGeometry(plane, fallback) }));
    if (candidates.length === 0) {
        return none;
    }
    const found = interaction.camera.occludingPlanes(
        space.camera,
        space.viewSize,
        planeGeometry(front, fallback),
        candidates,
        interaction.camera.OCCLUSION_THRESHOLD,
        target,
    );
    return found.length === 0
        ? none
        : { target, planeIDs: found.map((entry) => entry.planeID) };
};
// #endregion module
