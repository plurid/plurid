// #region imports
    // #region libraries
    import {
        Middleware,
    } from '@reduxjs/toolkit';
    // #endregion libraries


    // #region external
    import {
        arrangementSignature,
    } from '~services/logic/arrangement/signature';
    // #endregion external
// #endregion imports



// #region module
const UNDO = 'space/undo';
const REDO = 'space/redo';

/** Bound stack depth. Snapshots hold tree/link references, so this is cheap; the cap just bounds memory. */
const HISTORY_LIMIT = 100;


interface ArrangementSnapshot {
    tree: unknown;
    links: unknown;
}


/**
 * Spatial undo/redo over the engine's authored arrangement: structure (spawn / close / open), manual
 * positions (drag-move / snap), and the link graph.
 *
 * Records one snapshot per change in the shared `arrangementSignature` (structure + pinned positions +
 * links) — so a single user action is one entry, while the relayout reflows it triggers are ignored
 * (they don't change the signature), which is what lets a restore stick instead of being re-reconciled
 * away. It is STATELESS: it compares THIS action's before/after signatures rather than tracking a
 * running `lastSignature` — a tracked signature would go stale across a skipped (`meta.remote`) remote
 * apply and mis-record the next relayout as a phantom entry. Watching the state before/after each
 * action (not specific action types) covers both the `setTree`/`setSpaceField` paths AND the direct-
 * mutation reducers (`transformSelectedPlanes`, `snapSelection`, `addPlaneLink`, …). Restore re-sets
 * tree + links atomically via `restoreArrangement` (raw, exact, no reconcile). Snapshots are references
 * to the immutable state slices, so the stacks are memory-cheap; history is closure-local (never
 * persisted, never serialized, never renders). Remote collaboration mutations (`meta.remote`) are
 * skipped — a peer's change isn't in YOUR undo.
 */
export const createHistoryMiddleware = (): Middleware => {
    let undoStack: ArrangementSnapshot[] = [];
    let redoStack: ArrangementSnapshot[] = [];
    let applying = false;

    const snapshotOf = (state: any): ArrangementSnapshot => ({
        tree: state.space.tree,
        links: state.space.links,
    });

    const restore = (dispatch: any, snapshot: ArrangementSnapshot) => {
        applying = true;
        dispatch({
            type: 'space/restoreArrangement',
            payload: { tree: snapshot.tree, links: snapshot.links },
        });
        applying = false;
    };

    return (store) => (next) => (action: any) => {
        if (action.type === UNDO) {
            if (undoStack.length === 0) {
                return undefined;
            }
            const previous = undoStack.pop() as ArrangementSnapshot;
            redoStack.push(snapshotOf(store.getState()));
            restore(store.dispatch, previous);
            return undefined;
        }

        if (action.type === REDO) {
            if (redoStack.length === 0) {
                return undefined;
            }
            const future = redoStack.pop() as ArrangementSnapshot;
            undoStack.push(snapshotOf(store.getState()));
            restore(store.dispatch, future);
            return undefined;
        }

        const previousState = store.getState() as any;
        const previousTree = previousState.space.tree;
        const previousLinks = previousState.space.links;

        const result = next(action);

        // Don't record our own restores, or a peer's remotely-applied change.
        if (applying || action.meta?.remote) {
            return result;
        }

        const nextState = store.getState() as any;
        // Fast path: neither slice changed reference (e.g. the per-frame orbit transform actions).
        if (nextState.space.tree === previousTree
            && nextState.space.links === previousLinks) {
            return result;
        }

        // Compare THIS action's before/after arrangement. A relayout reflow leaves the signature
        // unchanged (it only moves auto-layout positions) and is ignored; a real authoring change
        // (plane added/removed/shown/hidden/moved, link edited) flips it and is recorded.
        const previousSignature = arrangementSignature(previousTree, previousLinks);
        const nextSignature = arrangementSignature(nextState.space.tree, nextState.space.links);
        if (previousSignature !== nextSignature) {
            undoStack.push({ tree: previousTree, links: previousLinks });
            if (undoStack.length > HISTORY_LIMIT) {
                undoStack.shift();
            }
            redoStack = []; // a fresh user action invalidates the redo branch
        }

        return result;
    };
}
// #endregion module



// #region exports
export default createHistoryMiddleware;
// #endregion exports
