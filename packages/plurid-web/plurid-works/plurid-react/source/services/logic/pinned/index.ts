// #region imports
    // #region libraries
    import type {
        AnyAction,
        ThunkDispatch,
    } from '@reduxjs/toolkit';

    import type {
        TreePlane,
        PluridPinnedRect,
        PluridPinnedPlane,
        PluridPlaceOptions,
        PluridPlaceResult,
        PluridScreenRect,
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
        commitCameraTarget,
        planeGeometry,
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    import {
        planePath,
    } from '~services/logic/arrangement/fragment';
    import {
        warnOnce,
    } from '~services/logic/development/warn';
    // #endregion external
// #endregion imports



// #region module
/**
 * PINNED PLANES (2026-10-31): a plane lifted onto the screen-space layer above the space, at a
 * fixed rect the camera does not move, and put back into the space where its frame is. The pin is
 * the plane's tree node's (`TreePlane.pinned`): the same route, id and content, persisted with the
 * tree, carried through relayouts, and out of the roots' layout while it lasts.
 */

type Dispatch = ThunkDispatch<AppState, PluridThunkExtra | undefined, AnyAction>;
type GetState = () => AppState;

const {
    camera: cameraEngine,
} = interaction;
const pinnedGeometry = spaceEngine.pinned;

/** Every plane of the tree, depth first. */
const everyPlane = (
    tree: TreePlane[],
    into: TreePlane[] = [],
): TreePlane[] => {
    for (const plane of tree || []) {
        into.push(plane);
        everyPlane(plane.children || [], into);
    }
    return into;
};

/**
 * The pinned planes that are shown, back first (their stacking order). A closed plane, or one under
 * a closed plane, renders nothing to pin: its frame goes with it and comes back when it is opened.
 * Walked without a copy of the tree: the layer and the bus read it on every store change.
 */
const pinnedNodes = (
    tree: TreePlane[],
): TreePlane[] => {
    const found: TreePlane[] = [];
    const walk = (nodes: TreePlane[] | undefined) => {
        for (const node of nodes || []) {
            if (node.show === false) {
                continue;
            }
            if (node.pinned) {
                found.push(node);
            }
            if (node.children && node.children.length > 0) {
                walk(node.children);
            }
        }
    };
    walk(tree);
    return found.length > 1
        ? found.sort((a, b) => (a.pinned!.order - b.pinned!.order) || a.planeID.localeCompare(b.planeID))
        : found;
};

/** The plane, when it and every plane it hangs from are shown. */
const shownPlane = (
    tree: TreePlane[],
    planeID: string,
): TreePlane | undefined => {
    for (const node of tree || []) {
        if (node.show === false) {
            continue;
        }
        if (node.planeID === planeID) {
            return node;
        }
        const found = shownPlane(node.children || [], planeID);
        if (found) {
            return found;
        }
    }
    return undefined;
};

const nextOrder = (
    tree: TreePlane[],
): number => everyPlane(tree).reduce((highest, plane) => Math.max(highest, plane.pinned?.order ?? 0), 0) + 1;

const NO_PINNED: PluridPinnedPlane[] = [];

/**
 * THE PINNED PLANES AS THE LAYER DRAWS THEM, back first: each frame in view px (an expanded plane at
 * its rect, a collapsed one as its bar in its slot along the bottom edge).
 */
export const pinnedPlanesOf = (
    state: Pick<AppState, 'space'>,
): PluridPinnedPlane[] => pinnedPlanesFrom(state.space.tree, state.space.viewSize);

export const pinnedPlanesFrom = (
    tree: TreePlane[],
    view: AppState['space']['viewSize'],
): PluridPinnedPlane[] => {
    const nodes = pinnedNodes(tree || []);
    if (nodes.length === 0) {
        return NO_PINNED;
    }
    view = view || { width: 0, height: 0 };
    const slots = pinnedGeometry.collapsedSlots(
        nodes.filter((plane) => plane.pinned!.collapsed).map((plane) => plane.planeID),
        view,
    );
    return nodes.map((plane) => ({
        planeID: plane.planeID,
        route: plane.route,
        rect: plane.pinned!.rect,
        collapsed: !!plane.pinned!.collapsed,
        order: plane.pinned!.order,
        frame: plane.pinned!.collapsed
            ? slots[plane.planeID]
            : pinnedGeometry.resolvePinnedRect(plane.pinned!.rect, view),
    }));
};

/** The frames the expanded pinned planes stand in, for a free slot to keep clear of. */
const takenFrames = (
    state: AppState,
): PluridScreenRect[] => pinnedPlanesOf(state)
    .filter((plane) => !plane.collapsed)
    .map((plane) => plane.frame);

const warn = (
    state: AppState,
    key: string,
    message: string,
) => warnOnce(key, message, state.configuration.development?.warnings !== false);


/**
 * OPEN A ROUTE AS A NEW PINNED PLANE: a root of this space made as opening the route would, already
 * on the screen (at `rect`, else a free slot on the right edge), its node and its view entry written
 * together, so the roots are not relaid and none of them moves. The plane's id, or `undefined` for a
 * route the application does not register.
 */
export const openPinnedPlane = (
    route: string,
    options: { rect?: PluridPinnedRect; collapsed?: boolean } = {},
) => (
    dispatch: Dispatch,
    getState: GetState,
    extra?: PluridThunkExtra,
): string | undefined => {
    const state = getState();
    const made = typeof route === 'string' && route ? extra?.resolvePlane?.(route) : undefined;
    if (!made) {
        warn(state, 'pinned-open:' + route, `no plane is registered at '${route}': nothing was pinned.`);
        return undefined;
    }
    const plane: TreePlane = {
        ...made,
        pinned: {
            rect: options.rect ?? pinnedGeometry.freePinnedRect(state.space.viewSize, takenFrames(state)),
            ...(options.collapsed ? { collapsed: true } : {}),
            order: nextOrder(state.space.tree),
        },
    };
    dispatch(actions.space.addRootPlane({ plane, path: route }));
    return plane.planeID;
};


/**
 * PIN A PLANE TO THE SCREEN, at `rect`, else at a free slot on the right edge sized as the plane is
 * drawn now (within the slot's bounds). A plane already pinned takes the new rect, if one is given,
 * and comes to the front. `false` for a plane the tree does not hold, a closed one (or one under a
 * closed plane), or one registered `pinnable: false` (its content cannot move: an `<iframe>`, a
 * `<webview>`).
 */
export const pinPlane = (
    planeID: string,
    rect?: PluridPinnedRect,
) => (
    dispatch: Dispatch,
    getState: GetState,
    extra?: PluridThunkExtra,
): boolean => {
    const state = getState();
    const plane = planeID ? shownPlane(state.space.tree, planeID) : undefined;
    if (!plane) {
        return false;
    }
    if (extra?.registeredPlane?.(plane.sourceID)?.pinnable === false) {
        warn(state, 'pinned-refused:' + plane.sourceID, `the plane at '${plane.route}' is registered \`pinnable: false\`: it stays in the space.`);
        return false;
    }
    const order = nextOrder(state.space.tree);
    if (plane.pinned) {
        dispatch(actions.space.patchPlanes([{
            planeID,
            patch: { pinned: { ...plane.pinned, ...(rect ? { rect } : {}), order } },
        }]));
        return true;
    }
    const view = state.space.viewSize;
    const drawn = cameraEngine.projectedBounds(
        state.space.camera,
        view,
        planeGeometry(plane, resolvePlaneFallbackSize(state.configuration, view)),
    );
    const others = takenFrames(state);
    const chosen = rect ?? pinnedGeometry.freePinnedRect(
        view,
        others,
        drawn ? { width: Math.min(560, Math.max(320, drawn.width)), height: Math.min(view.height * 0.8, Math.max(240, drawn.height)) } : undefined,
    );
    if (drawn && extra) {
        (extra.pinFlights ??= new Map()).set(planeID, drawn);
    }
    dispatch(actions.space.patchPlanes([{
        planeID,
        patch: { pinned: { rect: chosen, order } },
    }]));
    return true;
};


/** Collapse a pinned plane to its title bar, or expand it (`false`); toggle without an argument. */
export const collapsePinnedPlane = (
    planeID: string,
    collapsed?: boolean,
) => (
    dispatch: Dispatch,
    getState: GetState,
): boolean => {
    const plane = spaceEngine.tree.logic.getTreePlaneByID(getState().space.tree, planeID);
    if (!plane?.pinned) {
        return false;
    }
    const next = collapsed ?? !plane.pinned.collapsed;
    if (!!plane.pinned.collapsed === next) {
        return true;
    }
    const { collapsed: _was, ...rest } = plane.pinned;
    dispatch(actions.space.patchPlanes([{
        planeID,
        patch: { pinned: next ? { ...rest, collapsed: true } : rest },
    }]));
    return true;
};


/** Bring a pinned plane to the front of the pinned planes. */
export const raisePinnedPlane = (
    planeID: string,
) => (
    dispatch: Dispatch,
    getState: GetState,
): boolean => {
    const tree = getState().space.tree;
    const plane = spaceEngine.tree.logic.getTreePlaneByID(tree, planeID);
    if (!plane?.pinned) {
        return false;
    }
    const highest = nextOrder(tree) - 1;
    if (plane.pinned.order === highest && pinnedNodes(tree).filter((node) => node.pinned!.order === highest).length === 1) {
        return true;
    }
    dispatch(actions.space.patchPlanes([{
        planeID,
        patch: { pinned: { ...plane.pinned, order: highest + 1 } },
    }]));
    return true;
};


/**
 * PLACE A PINNED PLANE BACK INTO THE SPACE, WHERE ITS FRAME IS (2026-10-31). The plane is set in the
 * world face-on, at the size of its frame and at the depth where one of its px is one screen px,
 * under the frame's corner (`placementForRect`): the picture does not move when the frame gives way
 * to the plane, and the content, laid out at the same size, does not reflow.
 *
 * A face-on plane needs a level camera (its turn has two angles). When the camera is turned both
 * ways the camera is levelled first, through the motion controller, an EXCLUSIVE tween: the frame
 * stays where it is on the screen while the space turns under it, and the plane lands at the
 * tween's end. Reduced motion levels it at once. An input or another move that takes the camera
 * interrupts it, and the plane stays pinned (`interrupted`).
 *
 * The plane becomes a regular plane, hand-sized to its frame: a root stays a root (FREE: the layout
 * gives it no slot, so placing it moves no other root), a child its parent's child, on a leash;
 * `parentPlaneID` hangs it under another plane (`''`: as a root).
 */
export const placePinnedPlane = (
    planeID: string,
    options: PluridPlaceOptions = {},
) => (
    dispatch: Dispatch,
    getState: GetState,
    extra?: PluridThunkExtra,
): Promise<PluridPlaceResult> => {
    const state = getState();
    const plane = planeID ? spaceEngine.tree.logic.getTreePlaneByID(state.space.tree, planeID) : undefined;
    if (!plane?.pinned) {
        return Promise.resolve('refused');
    }
    if (options.parentPlaneID && !spaceEngine.tree.logic.getTreePlaneByID(state.space.tree, options.parentPlaneID)) {
        warn(state, 'pinned-place-parent:' + options.parentPlaneID, `there is no plane '${options.parentPlaneID}' to place '${plane.route}' under: it stays pinned.`);
        return Promise.resolve('refused');
    }
    const rect = pinnedGeometry.resolvePinnedRect(plane.pinned.rect, state.space.viewSize);

    return new Promise<PluridPlaceResult>((resolve) => {
        let done = false;
        const finish = (result: PluridPlaceResult) => {
            if (!done) {
                done = true;
                resolve(result);
            }
        };

        const land = () => {
            const now = getState();
            const current = spaceEngine.tree.logic.getTreePlaneByID(now.space.tree, planeID);
            if (!current?.pinned) {
                finish('refused');
                return;
            }
            const placement = cameraEngine.placementForRect(now.space.camera, now.space.viewSize, rect);
            const wanted = options.parentPlaneID;
            // one step of the history: the re-hang and the placement undo together
            dispatch(actions.space.historyBegin());
            try {
                if (wanted !== undefined && wanted !== (current.parentPlaneID ?? '')) {
                    dispatch(actions.space.moveUnder({ planeID, parentPlaneID: wanted, path: planePath(current) }));
                }
                const root = !!getState().space.tree.find((node) => node.planeID === planeID);
                dispatch(actions.space.patchPlanes([{
                    planeID,
                    patch: {
                        pinned: undefined,
                        location: placement.location,
                        manuallyPositioned: true,
                        free: root ? true : undefined,
                        sizeMode: 'manual',
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                    },
                }]));
            } finally {
                dispatch(actions.space.historyEnd());
            }
            finish('placed');
        };

        const camera = state.space.camera;
        if (cameraEngine.facesCameraExactly(camera)) {
            land();
            return;
        }
        commitCameraTarget(
            dispatch as any,
            extra,
            cameraEngine.levelCamera(camera),
            {
                animate: options.animate ?? true,
                ...(options.duration !== undefined ? { duration: options.duration } : {}),
                ...(options.easing ? { easing: options.easing } : {}),
                onSettle: land,
                onInterrupt: () => finish('interrupted'),
            },
            state,
        );
    });
};
// #endregion module
