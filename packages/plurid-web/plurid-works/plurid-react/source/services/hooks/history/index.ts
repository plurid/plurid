// #region imports
    // #region libraries
    import {
        useMemo,
    } from 'react';

    import {
        PluridStateHistory,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import actions from '~services/state/actions';
    // #endregion external


    // #region internal
    import {
        useEngineSelector,
        useEngineDispatch,
    } from '../engine';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridHistoryHandle extends PluridStateHistory {
    undo: () => void;
    redo: () => void;
    /**
     * Jump `index` steps at once, as ONE restore: negative undoes (`-2` = two undos), positive
     * redoes. The steps are `past` (oldest first) and `future` (nearest first), each with its label.
     */
    goTo: (index: number) => void;
    /** Fold every arrangement change until `end()` into ONE history entry. */
    begin: () => void;
    end: () => void;
}


/** Spatial undo/redo, as a hook: availability, depths, and the commands. */
export const usePluridHistory = (): PluridHistoryHandle => {
    const dispatch = useEngineDispatch();
    const history = useEngineSelector((state) => state.space.history);

    const commands = useMemo(() => ({
        undo: () => { dispatch(actions.space.undo()); },
        redo: () => { dispatch(actions.space.redo()); },
        goTo: (index: number) => { dispatch(actions.space.historyGoTo({ index })); },
        begin: () => { dispatch(actions.space.historyBegin()); },
        end: () => { dispatch(actions.space.historyEnd()); },
    }), [dispatch]);

    return {
        ...history,
        ...commands,
    };
};
// #endregion module
