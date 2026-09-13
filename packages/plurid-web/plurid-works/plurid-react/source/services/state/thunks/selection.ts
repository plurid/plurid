// #region imports
    // #region libraries
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
    } from '~services/engine';

    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';

    import {
        navigatePlane,
        getActivePlane,
    } from '~services/logic/animation';

    import {
        planesInScreenRect,
        projectedPlaneCenters,
        nearestInDirection,
        ScreenRect,
        Direction,
    } from '~services/logic/selection';

    import {
        fragmentOf,
        parseFragment,
        serializeFragment,
        materializeFragment,
        planePath,
        ArrangementFragment,
    } from '~services/logic/arrangement/fragment';
    import {
        readSlot,
        writeClipboardText,
    } from '~services/logic/clipboard';

    import {
        closePlane,
    } from '~services/state/thunks/planes';

    import { PluridThunkExtra } from '~services/state/extra';
    // #endregion external
// #endregion imports



// #region module
type Dispatch = ThunkDispatch<{}, {}, AnyAction>;
type GetState = () => AppState;
export type SelectionThunk = (dispatch: Dispatch, getState: GetState) => void;
/** A thunk that needs the application's own things (the registrar): the store's third argument. */
export type SelectionExtraThunk = (dispatch: Dispatch, getState: GetState, extra: PluridThunkExtra) => void;

/** How far a paste steps away from what it lands on, px. */
const PASTE_STEP = 40;

const fallbackOf = (
    state: AppState,
) => resolvePlaneFallbackSize(state.configuration, state.space.viewSize);

const snapOptionsOf = (
    state: AppState,
) => {
    const snap = state.configuration.space.snap;
    return {
        threshold: snap?.threshold,
        grid: snap?.grid,
        enabled: snap?.enabled !== false,
    };
};


/** Snap the selection after a drag (edge/center/grid), through the shared snap engine. */
export const snapSelectionNow = (): SelectionThunk => (dispatch, getState) => {
    const state = getState();
    const options = snapOptionsOf(state);
    if (!options.enabled) {
        return;
    }
    const fallback = fallbackOf(state);
    dispatch(actions.space.snapSelection({
        threshold: options.threshold,
        grid: options.grid,
        fallbackWidth: fallback.width,
        fallbackHeight: fallback.height,
    }));
};


export const alignSelection = (
    edge: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY',
): SelectionThunk => (dispatch, getState) => {
    const fallback = fallbackOf(getState());
    dispatch(actions.space.alignSelection({
        edge,
        fallbackWidth: fallback.width,
        fallbackHeight: fallback.height,
    }));
};


export const distributeSelection = (
    axis: 'x' | 'y',
): SelectionThunk => (dispatch, getState) => {
    const fallback = fallbackOf(getState());
    dispatch(actions.space.distributeSelection({
        axis,
        fallbackWidth: fallback.width,
        fallbackHeight: fallback.height,
    }));
};


export const duplicateSelection = (
    offset = 40,
): SelectionThunk => (dispatch) => {
    dispatch(actions.space.duplicateSelection({ offset }));
};


/**
 * THE SELECTION AS TEXT (`fragmentOf`): what a copy puts on the clipboard — the selected planes with
 * their subtrees and the links among them. `null` when nothing is selected, so a copy with no
 * selection leaves the clipboard to the page.
 */
export const selectionFragmentText = (
    state: AppState,
): string | null => {
    const fragment = fragmentOf(
        state.space.tree,
        state.space.selectedPlaneIDs,
        state.space.links,
        typeof location !== 'undefined' ? location.host : undefined,
    );
    return fragment ? serializeFragment(fragment) : null;
};


/**
 * COPY the selection to the clipboard (and to the module's slot, which is what a paste falls back
 * to). `cut` closes the copied planes afterwards, as ONE history entry.
 */
export const copySelection = (
    options: { cut?: boolean } = {},
): SelectionThunk => (dispatch, getState) => {
    const state = getState();
    const text = selectionFragmentText(state);
    if (!text) {
        return;
    }

    writeClipboardText(text);

    if (!options.cut) {
        return;
    }

    const copied = state.space.selectedPlaneIDs;
    dispatch(actions.space.historyBegin());
    for (const planeID of copied) {
        dispatch(closePlane(planeID, { navigate: 'stay' }) as any);
    }
    dispatch(actions.space.clearSelection());
    dispatch(actions.space.historyEnd());
};


/** Where a pasted set lands: stepped away from anything of its own kind already sitting there. */
const pasteOffset = (
    tree: TreePlane[],
    fragment: ArrangementFragment,
    step = PASTE_STEP,
): { x: number; y: number } => {
    const here = new Map(tree.map((root) => [planePath(root), root]));
    const occupied = (
        distance: number,
    ) => fragment.planes.some((node) => {
        const root = here.get(node.path);
        return !!root
            && Math.abs(root.location.translateX - (node.location.translateX + distance)) < 1
            && Math.abs(root.location.translateY - (node.location.translateY + distance)) < 1;
    });

    let distance = 0;
    // a paste never lands exactly on its own original — and a second paste steps past the first
    for (let guard = 0; guard < 64 && occupied(distance); guard += 1) {
        distance += step;
    }
    return { x: distance, y: distance };
};


export interface PasteFragmentOptions {
    /** The clipboard's text (a `paste` event's). Without it, what this document last copied. */
    text?: string | null;
    /** A fragment a host already holds — no text, no clipboard. */
    fragment?: ArrangementFragment;
    /** Called with the routes this space does not register, when any were dropped. */
    onDropped?: (routes: string[]) => void;
}

/**
 * PASTE an arrangement fragment: the planes it can hold, with fresh ids and their links remapped,
 * appended to the tree as the new selection — one action, one history entry. Text that is not a
 * fragment does nothing at all (the paste stays the page's).
 */
export const pasteFragment = (
    options: PasteFragmentOptions = {},
): SelectionExtraThunk => (dispatch, getState, extra) => {
    const fragment = options.fragment ?? parseFragment(options.text ?? readSlot());
    if (!fragment) {
        return;
    }

    const state = getState();
    const resolve = extra?.resolvePlane;
    if (!resolve) {
        // no application, no registrar: nothing here can make a plane out of a path
        return;
    }

    const {
        planes,
        links,
        dropped,
    } = materializeFragment(fragment, {
        resolve,
        taken: spaceEngine.tree.fields.collectPlaneIDs(state.space.tree),
        offset: pasteOffset(state.space.tree, fragment),
    });

    if (dropped.length > 0) {
        options.onDropped?.(dropped);
    }
    if (planes.length === 0) {
        return;
    }

    dispatch(actions.space.insertPlanes({ tree: planes, links }));
};


/**
 * The marquee's result: the planes whose projected rect intersects the screen rect — replacing
 * the selection, added to it (`add`), or removed from it (`subtract`).
 */
export const selectInScreenRect = (
    rect: ScreenRect,
    mode: 'set' | 'add' | 'subtract' = 'set',
): SelectionThunk => (dispatch, getState) => {
    const state = getState();
    const {
        tree,
        camera,
        viewSize,
        selectedPlaneIDs,
    } = state.space;

    const hits = planesInScreenRect(tree, camera, viewSize, rect, fallbackOf(state));

    if (mode === 'set') {
        dispatch(actions.space.setSelection(hits));
        return;
    }
    const current = new Set(selectedPlaneIDs);
    if (mode === 'add') {
        for (const id of hits) {
            current.add(id);
        }
    } else {
        for (const id of hits) {
            current.delete(id);
        }
    }
    dispatch(actions.space.setSelection([...current]));
};


/**
 * Keyboard plane navigation: from the active plane (or the view center), the nearest plane in a
 * screen direction becomes active and is framed.
 */
export const navigateDirection = (
    direction: Direction,
): SelectionThunk => (dispatch, getState) => {
    const state = getState();
    const {
        tree,
        camera,
        viewSize,
    } = state.space;
    const fallback = fallbackOf(state);
    const centers = projectedPlaneCenters(tree, camera, viewSize, fallback);
    if (centers.length === 0) {
        return;
    }

    const active = getActivePlane(state);
    const from = active
        ? centers.find((center) => center.id === active.planeID)
        : undefined;
    const origin = from
        ? { x: from.x, y: from.y }
        : { x: viewSize.width / 2, y: viewSize.height / 2 };
    const candidates = centers.filter((center) => center.id !== active?.planeID);

    const targetID = nearestInDirection(candidates, origin, direction)
        ?? (from ? undefined : candidates[0]?.id);
    if (!targetID) {
        return;
    }

    const target = spaceEngine.tree.logic.getTreePlaneByID(tree, targetID);
    if (!target) {
        return;
    }
    dispatch(navigatePlane(target, { deisolate: false }) as any);
};
// #endregion module
