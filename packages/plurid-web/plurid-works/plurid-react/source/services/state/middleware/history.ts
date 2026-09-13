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
    import {
        rebaseSnapshot,
        Arrangement,
    } from '~services/logic/arrangement/rebase';
    import {
        describeArrangementChange,
    } from '~services/logic/arrangement/describe';
    // #endregion external
// #endregion imports



// #region module
const UNDO = 'space/undo';
const REDO = 'space/redo';
const GO_TO = 'space/historyGoTo';
const BEGIN = 'space/historyBegin';
const END = 'space/historyEnd';
const STATUS = 'space/setHistoryStatus';

/** Bound stack depth. Snapshots hold tree/link references, so this is cheap; the cap just bounds memory. */
const HISTORY_LIMIT = 100;


interface ArrangementSnapshot {
    tree: unknown;
    links: unknown;
}

/** A stack entry: the arrangement to restore, and what the step that made it was called. */
interface HistoryStep {
    snapshot: ArrangementSnapshot;
    label: string;
    at: number;
}

/** A stack entry: the arrangement to restore, and what the step that made it was called. */
interface HistoryStep {
    snapshot: ArrangementSnapshot;
    label: string;
    at: number;
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
 * change isn't in YOUR undo — AND every local snapshot is REBASED over them (2026-09-10; the interim
 * rule of 2026-09-06 cleared the stacks): `apply(remote, diff(before, snapshot))` keeps the local
 * changes on the planes they touch and the peer's work everywhere else, so an undo after a peer's
 * change never restores the arrangement without that change; a snapshot with nothing local left is
 * dropped. After every stack change the availability AND the steps' names are written to `state.space.history`
 * (`setHistoryStatus`): every entry carries a LABEL derived from what the change did
 * (`describeArrangementChange` — never authored, so it cannot drift) and the time it happened, which
 * is what a scrubber lists. `space/historyGoTo` jumps `index` steps (negative undoes, positive
 * redoes) as ONE restore.
 */
export const createHistoryMiddleware = (): Middleware => {
    const undoStack: HistoryStep[] = [];
    let redoStack: HistoryStep[] = [];
    let applying = false;
    let transactionDepth = 0;
    let transactionBefore: ArrangementSnapshot | null = null;

    const snapshotOf = (state: any): ArrangementSnapshot => ({
        tree: state.space.tree,
        links: state.space.links,
    });

    const entriesOf = (stack: HistoryStep[]) => stack.map(({ label, at }) => ({ label, at }));
    const signatureOf = (history: any) => JSON.stringify([
        history?.canUndo, history?.canRedo, history?.undoDepth, history?.redoDepth,
        history?.past, history?.future,
    ]);

    const publishStatus = (store: any) => {
        const current = store.getState().space.history;
        const next = {
            canUndo: undoStack.length > 0,
            canRedo: redoStack.length > 0,
            undoDepth: undoStack.length,
            redoDepth: redoStack.length,
            past: entriesOf(undoStack),
            future: entriesOf(redoStack).slice().reverse(),
        };
        if (signatureOf(current) !== signatureOf(next)) {
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
        undoStack.push({
            snapshot: before,
            label: describeArrangementChange(before as Arrangement, after as Arrangement),
            at: Date.now(),
        });
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
        if (action.type === UNDO || action.type === REDO || action.type === GO_TO) {
            // one step by default; a jump names how many, and which way (negative undoes)
            const asked = action.type === GO_TO
                ? Math.trunc(action.payload?.index ?? 0)
                : (action.type === UNDO ? -1 : 1);
            const steps = asked < 0
                ? -Math.min(-asked, undoStack.length)
                : Math.min(asked, redoStack.length);
            if (steps === 0) {
                return undefined;
            }
            // the arrangement to land on is the LAST step walked over; the ones before it move across
            let landing: HistoryStep | undefined;
            for (let walked = 0; walked < Math.abs(steps); walked += 1) {
                const present: HistoryStep = {
                    snapshot: snapshotOf(store.getState()),
                    label: '',
                    at: Date.now(),
                };
                if (steps < 0) {
                    const step = undoStack.pop()!;
                    // the step's own name travels with it: redoing it is doing that change again
                    redoStack.push({ ...present, label: step.label });
                    landing = step;
                } else {
                    const step = redoStack.pop()!;
                    undoStack.push({ ...present, label: step.label });
                    landing = step;
                }
            }
            restore(store.dispatch, landing!.snapshot);
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
            // REBASED UNDO: a peer's arrangement landed — every local snapshot is replayed over it
            // (`apply(remote, diff(before, snapshot))`): the local changes on the planes they touch,
            // the peer's work everywhere else; a snapshot with nothing local left — one that differed
            // only in automatic positions, say — is dropped
            if (undoStack.length > 0 || redoStack.length > 0 || transactionBefore) {
                const remote = snapshotOf(store.getState());
                const rebase = (stack: HistoryStep[]): HistoryStep[] => {
                    const rebased: HistoryStep[] = [];
                    for (const step of stack) {
                        const snapshot = rebaseSnapshot(step.snapshot as Arrangement, before as Arrangement, remote as Arrangement);
                        if (snapshot) {
                            rebased.push({ ...step, snapshot });
                        }
                    }
                    return rebased;
                };
                const undoRebased = rebase(undoStack);
                undoStack.length = 0;
                undoStack.push(...undoRebased);
                redoStack = rebase(redoStack);
                if (transactionBefore) {
                    transactionBefore = rebaseSnapshot(transactionBefore as Arrangement, before as Arrangement, remote as Arrangement) ?? remote;
                }
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
