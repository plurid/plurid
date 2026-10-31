// #region imports
    // #region libraries
    import type {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import type {
        TreePlane,
        PluridStack,
        PluridStackOptions,
        PluridStackPlacement,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    import type {
        AppState,
    } from '~services/state/store';
    import type {
        PluridThunkExtra,
    } from '~services/state/extra';
    import {
        interaction,
        space as spaceEngine,
    } from '~services/engine';
    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    import {
        warnOnce,
    } from '~services/logic/development/warn';
    // #endregion external
// #endregion imports



// #region module
/**
 * STACKED PLANES (2026-10-31): 2 to 12 planes set one behind another in depth, facing the camera,
 * each a step down-right of and nearer than the one behind it so every title shows, the stack's
 * middle on the view's centre (`interaction.camera.stackLocations`).
 *
 * THE MECHANISM is the engine's own per-plane placement, the one a drag writes: each plane gets a
 * `location` and `manuallyPositioned`, so a relayout leaves it where the stack put it (a child goes
 * on a leash). What each plane had before is kept on the stack (`state.space.stacks`, persisted),
 * and `unstack` writes it back exactly; a plane stacked again keeps the placement it had before its
 * first stack. The planes glide there with the relayout's glide (the plane transforms' transition,
 * for `navigation.motion.duration`), instant under reduced motion; a later placement retargets the
 * glide from wherever the planes are. The stack and the unstack are each one step of the history;
 * the stacks themselves are not the history's: an undone stack puts the planes back and stays
 * listed (an `unstack` of it then moves nothing and forgets it), and a redo stacks them under it again.
 */

type Dispatch = ThunkDispatch<AppState, PluridThunkExtra | undefined, AnyAction>;
type GetState = () => AppState;

export const STACK_MINIMUM = 2;
export const STACK_MAXIMUM = 12;

const {
    camera: cameraEngine,
} = interaction;

/** A plane is in the space to be stacked: in the tree, shown with what it hangs from, not pinned. */
const inTheSpace = (
    tree: TreePlane[],
    planeID: string,
): TreePlane | undefined => {
    const find = (nodes: TreePlane[] | undefined): TreePlane | undefined => {
        for (const node of nodes || []) {
            if (node.show === false) {
                continue;
            }
            if (node.planeID === planeID) {
                return node.pinned ? undefined : node;
            }
            const found = find(node.children);
            if (found) {
                return found;
            }
        }
        return undefined;
    };
    return find(tree);
};

const nextStackID = (
    stacks: Record<string, PluridStack>,
): string => {
    let highest = 0;
    for (const stackID of Object.keys(stacks)) {
        const number = Number(stackID.replace(/^stack-/, ''));
        if (Number.isFinite(number)) {
            highest = Math.max(highest, number);
        }
    }
    return 'stack-' + (highest + 1);
};

/** The stacks without these planes; a stack left with none goes. */
const without = (
    stacks: Record<string, PluridStack>,
    planeIDs: Set<string>,
): Record<string, PluridStack> => {
    const next: Record<string, PluridStack> = {};
    for (const [stackID, stack] of Object.entries(stacks)) {
        const kept = stack.planeIDs.filter((planeID) => !planeIDs.has(planeID));
        if (kept.length === 0) {
            continue;
        }
        if (kept.length === stack.planeIDs.length) {
            next[stackID] = stack;
            continue;
        }
        const previous: Record<string, PluridStackPlacement> = {};
        for (const planeID of kept) {
            previous[planeID] = stack.previous[planeID];
        }
        next[stackID] = { ...stack, planeIDs: kept, previous };
    }
    return next;
};

/** Glide what follows, for the configured motion, unless the reader prefers reduced motion. */
const glide = (
    dispatch: Dispatch,
    state: AppState,
    extra: PluridThunkExtra | undefined,
    animate: boolean | undefined,
) => {
    if (animate === false || extra?.motion?.reducedMotion()) {
        return;
    }
    const duration = state.configuration.space.navigation?.motion?.duration ?? 380;
    if (duration > 0) {
        dispatch(actions.space.setLayoutTransition(duration));
    }
};


/**
 * STACK THESE PLANES (front first): their placements before, on the new stack; the stack's id, or
 * `undefined` (fewer than 2 or more than 12 planes, a plane not in the space, a pinned one).
 */
export const stackPlanes = (
    planeIDs: string[],
    options: PluridStackOptions = {},
) => (
    dispatch: Dispatch,
    getState: GetState,
    extra?: PluridThunkExtra,
): string | undefined => {
    const state = getState();
    const warnings = state.configuration.development?.warnings !== false;
    const ids = Array.isArray(planeIDs) ? [...new Set(planeIDs.filter((id) => typeof id === 'string' && id))] : [];
    if (ids.length < STACK_MINIMUM || ids.length > STACK_MAXIMUM) {
        warnOnce('stack-count', `a stack holds ${STACK_MINIMUM} to ${STACK_MAXIMUM} planes; ${ids.length} were given.`, warnings);
        return undefined;
    }
    const planes = ids.map((planeID) => inTheSpace(state.space.tree, planeID));
    const missing = ids.filter((_planeID, index) => !planes[index]);
    if (missing.length > 0) {
        warnOnce('stack-missing:' + missing.join(','), `these planes are not in the space to be stacked (absent, closed or pinned): ${missing.join(', ')}.`, warnings);
        return undefined;
    }

    const stacks = state.space.stacks || {};
    const previous: Record<string, PluridStackPlacement> = {};
    for (const plane of planes as TreePlane[]) {
        // a plane in a stack already keeps what it had before ITS FIRST stack
        const earlier = Object.values(stacks).find((stack) => stack.planeIDs.includes(plane.planeID));
        previous[plane.planeID] = earlier?.previous[plane.planeID] ?? {
            location: plane.location,
            ...(plane.manuallyPositioned !== undefined ? { manuallyPositioned: plane.manuallyPositioned } : {}),
        };
    }

    const view = state.space.viewSize;
    const fallback = resolvePlaneFallbackSize(state.configuration, view);
    const geometries = (planes as TreePlane[]).map((plane) => ({
        width: plane.width || fallback.width,
        height: plane.height || fallback.height,
        location: plane.location,
    }));
    const step = {
        ...cameraEngine.defaultStackStep(geometries[0]),
        ...(options.step || {}),
    };
    const locations = cameraEngine.stackLocations(state.space.camera, view, geometries, step, options.facing ?? 'camera');

    glide(dispatch, state, extra, options.animate);
    const stackID = nextStackID(stacks);
    dispatch(actions.space.historyBegin());
    try {
        dispatch(actions.space.patchPlanes(ids.map((planeID, index) => ({
            planeID,
            patch: { location: locations[index], manuallyPositioned: true },
        }))));
        dispatch(actions.space.setStacks({
            ...without(stacks, new Set(ids)),
            [stackID]: { stackID, planeIDs: ids, previous },
        }));
    } finally {
        dispatch(actions.space.historyEnd());
    }
    return stackID;
};


/**
 * PUT STACKED PLANES BACK, each exactly where it was before it was stacked: a stack by its id, or the
 * planes named (they leave their stacks). A plane removed since is skipped. `false` when nothing was
 * stacked.
 */
export const unstackPlanes = (
    reference: string | string[],
    options: { animate?: boolean } = {},
) => (
    dispatch: Dispatch,
    getState: GetState,
    extra?: PluridThunkExtra,
): boolean => {
    const state = getState();
    const stacks = state.space.stacks || {};
    const placements: [string, PluridStackPlacement][] = [];
    if (typeof reference === 'string') {
        const stack = stacks[reference];
        if (!stack) {
            return false;
        }
        for (const planeID of stack.planeIDs) {
            placements.push([planeID, stack.previous[planeID]]);
        }
    } else if (Array.isArray(reference)) {
        for (const planeID of reference) {
            const stack = Object.values(stacks).find((candidate) => candidate.planeIDs.includes(planeID));
            if (stack) {
                placements.push([planeID, stack.previous[planeID]]);
            }
        }
    }
    if (placements.length === 0) {
        return false;
    }

    const present = placements.filter(([planeID, placement]) => (
        !!placement && !!spaceEngine.tree.logic.getTreePlaneByID(state.space.tree, planeID)
    ));
    glide(dispatch, state, extra, options.animate);
    dispatch(actions.space.historyBegin());
    try {
        dispatch(actions.space.patchPlanes(present.map(([planeID, placement]) => ({
            planeID,
            patch: { location: placement.location, manuallyPositioned: placement.manuallyPositioned },
        }))));
        dispatch(actions.space.setStacks(without(stacks, new Set(placements.map(([planeID]) => planeID)))));
    } finally {
        dispatch(actions.space.historyEnd());
    }
    return true;
};


/** The stacks, as `space.changed` kind `stacks` lists them. */
export const stacksOf = (
    state: AppState,
): PluridStack[] => Object.values(state.space.stacks || {});
// #endregion module
