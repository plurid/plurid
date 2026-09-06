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
const BEGIN = 'space/historyBegin';
const END = 'space/historyEnd';
const STATUS = 'space/setHistoryStatus';

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
 * away. It is STATELESS between actions: it compares THIS action's before/after signatures rather than
 * tracking a running `lastSignature`. Watching the state before/after each action (not specific action
 * types) covers both the `setTree`/`setSpaceField` paths AND the direct-mutation reducers
 * (`transformSelectedPlanes`, `snapSelection`, `addPlaneLink`, …).
 *
 * TRANSACTIONS: `space/historyBegin` … `space/historyEnd` (ref-counted) fold every change in between
 * into ONE entry — a drag that dispatches per frame is one undo, not sixty. `meta.history === 'skip'`
 * bypasses recording for one action. Restore re-sets tree + links atomically via `restoreArrangement`
 * (raw, exact, no reconcile). Remote collaboration mutations (`meta.remote`) are skipped — a peer's
 * change isn't in YOUR undo — AND they clear both stacks (C03, 2026-09-06): a snapshot recorded before a
 * peer's change would restore the arrangement WITHOUT that change and broadcast the rollback as ours.
 * Until history is rebased over remote changes, a remote apply invalidates local history; hosts see
 * `canUndo` drop through `state.space.history`. After every stack change the availability is written to
 * `state.space.history` (`setHistoryStatus`) so hosts can render undo/redo controls.
 */
export const createHistoryMiddleware = (): Middleware => {
    const undoStack: ArrangementSnapshot[] = [];
    let redoStack: ArrangementSnapshot[] = [];
    let applying = false;
    let transactionDepth = 0;
    let transactionBefore: ArrangementSnapshot | null = null;

    const snapshotOf = (state: any): ArrangementSnapshot => ({
        tree: state.space.tree,
        links: state.space.links,
    });

    const publishStatus = (store: any) => {
        const current = store.getState().space.history;
        const next = {
            canUndo: undoStack.length > 0,
            canRedo: redoStack.length > 0,
            undoDepth: undoStack.length,
            redoDepth: redoStack.length,
        };
        if (
            !current
            || current.canUndo !== next.canUndo
            || current.canRedo !== next.canRedo
            || current.undoDepth !== next.undoDepth
            || current.redoDepth !== next.redoDepth
        ) {
            store.dispatch({ type: STATUS, payload: next });
        }
    };

    const record = (store: any, before: ArrangementSnapshot, after: ArrangementSnapshot) => {
        if (before.tree === after.tree && before.links === after.links) {
            return;
        }
        const previousSignature = arrangementSignature(before.tree as any, before.links as any);
        const nextSignature = arrangementSignature(after.tree as any, after.links as any);
        if (previousSignature === nextSignature) {
            return;
        }
        undoStack.push(before);
        if (undoStack.length > HISTORY_LIMIT) {
            undoStack.shift();
        }
        redoStack = []; // a fresh user action invalidates the redo branch
        publishStatus(store);
    };

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
            publishStatus(store);
            return undefined;
        }

        if (action.type === REDO) {
            if (redoStack.length === 0) {
                return undefined;
            }
            const future = redoStack.pop() as ArrangementSnapshot;
            undoStack.push(snapshotOf(store.getState()));
            restore(store.dispatch, future);
            publishStatus(store);
            return undefined;
        }

        if (action.type === BEGIN) {
            if (transactionDepth === 0) {
                transactionBefore = snapshotOf(store.getState());
            }
            transactionDepth += 1;
            return next(action);
        }

        if (action.type === END) {
            const result = next(action);
            if (transactionDepth > 0) {
                transactionDepth -= 1;
                if (transactionDepth === 0 && transactionBefore) {
                    record(store, transactionBefore, snapshotOf(store.getState()));
                    transactionBefore = null;
                }
            }
            return result;
        }

        if (action.type === STATUS) {
            return next(action);
        }

        const before = snapshotOf(store.getState());
        const result = next(action);

        // Don't record our own restores, a peer's remotely-applied change, an explicitly skipped
        // action, or anything inside a transaction (recorded once at its end).
        if (action.meta?.remote) {
            // a peer's arrangement landed: every local snapshot predates it — drop them (see above)
            if (undoStack.length > 0 || redoStack.length > 0) {
                undoStack.length = 0;
                redoStack = [];
                publishStatus(store);
            }
            return result;
        }
        if (applying || action.meta?.history === 'skip' || transactionDepth > 0) {
            return result;
        }

        record(store, before, snapshotOf(store.getState()));

        return result;
    };
}
// #endregion module



// #region exports
export default createHistoryMiddleware;
// #endregion exports
