// #region imports
    // #region libraries
    import {
        Middleware,
    } from '@reduxjs/toolkit';
    // #endregion libraries
// #endregion imports



// #region module
const SET_TREE = 'space/setTree';
const SET_SPACE_FIELD = 'space/setSpaceField';
const UNDO = 'space/undo';
const REDO = 'space/redo';

/** Bound stack depth. Snapshots are tree references, so this is cheap; the cap just bounds memory. */
const HISTORY_LIMIT = 100;


/** The tree-setting actions: dedicated `setTree` (close / open / relayout) + `setSpaceField({field:'tree'})` (spawn). */
const treeOfAction = (action: any): unknown | undefined => {
    if (action?.type === SET_TREE) {
        return action.payload;
    }
    if (action?.type === SET_SPACE_FIELD && action?.payload?.field === 'tree') {
        return action.payload.value;
    }
    return undefined;
}

/**
 * A STRUCTURAL signature of the tree — the sorted set of `planeID:show`, ignoring position. Two
 * trees with the same planes + visibility but different layout positions share a signature. This is
 * what makes undo work: every spawn/close/open fires SEVERAL `setTree`s (the change itself, then the
 * View's reactive relayouts + measurement re-flows), and only the first changes the structure. We
 * record one history entry per structural change and ignore the relayout churn — otherwise an undo's
 * restore would just be re-reconciled away by the next relayout. (A position-only edit — e.g. a
 * future drag-to-move — would need this extended to include location.)
 */
const signature = (tree: any): string => {
    const parts: string[] = [];
    const walk = (nodes: any[]) => {
        for (const node of nodes) {
            parts.push(node.planeID + ':' + (node.show ? 1 : 0));
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(Array.isArray(tree) ? tree : []);
    return parts.sort().join('|');
}


/**
 * Spatial undo/redo over the engine's tree mutations.
 *
 * Records one snapshot per STRUCTURAL change (see `signature`); restore re-sets the tree directly
 * (raw, exact) via `setSpaceField`. Snapshots are references to the immutable `state.space.tree`
 * (reducers produce new trees + `reconcileTree` shares structure), so the stacks are memory-cheap.
 * History lives in this closure — never persisted, never serialized, never triggers a render.
 */
export const createHistoryMiddleware = (): Middleware => {
    let undoStack: unknown[] = [];
    let redoStack: unknown[] = [];
    let applying = false;
    // Signature of the last committed structure — set lazily from the first tree we see.
    let lastSignature: string | null = null;

    const restore = (dispatch: any, tree: unknown) => {
        applying = true;
        dispatch({ type: SET_SPACE_FIELD, payload: { field: 'tree', value: tree } });
        applying = false;
        lastSignature = signature(tree);
    };

    return (store) => (next) => (action: any) => {
        if (action.type === UNDO) {
            if (undoStack.length === 0) {
                return undefined;
            }
            const previous = undoStack.pop();
            redoStack.push((store.getState() as any).space.tree);
            restore(store.dispatch, previous);
            return undefined;
        }

        if (action.type === REDO) {
            if (redoStack.length === 0) {
                return undefined;
            }
            const future = redoStack.pop();
            undoStack.push((store.getState() as any).space.tree);
            restore(store.dispatch, future);
            return undefined;
        }

        if (!applying) {
            const nextTree = treeOfAction(action);
            if (nextTree !== undefined) {
                const previousTree = (store.getState() as any).space.tree;
                if (lastSignature === null) {
                    lastSignature = signature(previousTree);
                }
                const nextSignature = signature(nextTree);
                if (nextSignature !== lastSignature) {
                    // A real structural change (plane added / removed / shown / hidden).
                    undoStack.push(previousTree);
                    if (undoStack.length > HISTORY_LIMIT) {
                        undoStack.shift();
                    }
                    lastSignature = nextSignature;
                    redoStack = []; // a fresh user action invalidates the redo branch
                }
                // else: a relayout/measurement re-flow (same structure) — ignore.
            }
        }

        return next(action);
    };
}
// #endregion module



// #region exports
export default createHistoryMiddleware;
// #endregion exports
