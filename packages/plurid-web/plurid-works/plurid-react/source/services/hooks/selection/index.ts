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
    }), [dispatch]);

    return {
        selected,
        activePlaneID,
        isSelected: (planeID: string) => selected.includes(planeID),
        ...commands,
    };
};
// #endregion module
