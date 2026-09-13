// #region imports
    // #region libraries
    import {
        useMemo,
    } from 'react';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';

    import {
        alignSelection,
        distributeSelection,
        duplicateSelection,
        copySelection,
        pasteFragment,
    } from '~services/state/thunks/selection';
    // #endregion external


    // #region internal
    import {
        useEngineSelector,
        useEngineDispatch,
    } from '../engine';
    // #endregion internal
// #endregion imports



// #region module
export type PluridAlignEdge = 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY';

export interface PluridSelectionHandle {
    /** The selected plane ids, in selection order. */
    selected: string[];
    /** The hover-active plane id ('' when none). */
    activePlaneID: string;
    isSelected: (planeID: string) => boolean;
    select: (planeIDs: string[]) => void;
    toggle: (planeID: string) => void;
    add: (planeID: string) => void;
    clear: () => void;
    selectAll: () => void;
    invert: () => void;
    align: (edge: PluridAlignEdge) => void;
    distribute: (axis: 'x' | 'y') => void;
    /** Offset copies of the selected root planes; the copies become the selection. */
    duplicate: (offset?: number) => void;
    /**
     * Put the selection on the clipboard as an arrangement fragment — the same text ⌘/Ctrl+C over
     * the space writes, so it pastes into another tab, window or site running plurid.
     */
    copy: (options?: { cut?: boolean }) => void;
    cut: () => void;
    /**
     * Paste a fragment: the given text, else what this document last copied. Text that is not a
     * fragment does nothing. Routes this application does not register are dropped.
     */
    paste: (text?: string) => void;
}


/** The selection, as a hook: read it and edit it (the same reducers the gestures and topics use). */
export const useSelection = (): PluridSelectionHandle => {
    const dispatch = useEngineDispatch();
    const selected = useEngineSelector((state) => state.space.selectedPlaneIDs);
    const activePlaneID = useEngineSelector((state) => state.space.activePlaneID);

    const commands = useMemo(() => ({
        select: (planeIDs: string[]) => { dispatch(actions.space.setSelection(planeIDs)); },
        toggle: (planeID: string) => { dispatch(actions.space.toggleSelection(planeID)); },
        add: (planeID: string) => { dispatch(actions.space.addToSelection(planeID)); },
        clear: () => { dispatch(actions.space.clearSelection()); },
        selectAll: () => { dispatch(actions.space.selectAll()); },
        invert: () => { dispatch(actions.space.invertSelection()); },
        align: (edge: PluridAlignEdge) => { dispatch(alignSelection(edge) as any); },
        distribute: (axis: 'x' | 'y') => { dispatch(distributeSelection(axis) as any); },
        duplicate: (offset?: number) => { dispatch(duplicateSelection(offset) as any); },
        copy: (options: { cut?: boolean } = {}) => { dispatch(copySelection(options) as any); },
        cut: () => { dispatch(copySelection({ cut: true }) as any); },
        paste: (text?: string) => { dispatch(pasteFragment({ text }) as any); },
    }), [dispatch]);

    return {
        selected,
        activePlaneID,
        isSelected: (planeID: string) => selected.includes(planeID),
        ...commands,
    };
};
// #endregion module
