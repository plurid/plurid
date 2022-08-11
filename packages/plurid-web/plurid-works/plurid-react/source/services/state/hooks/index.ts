// #region imports
    // #region libraries
    import {
        TypedUseSelectorHook,
        useDispatch,
        useSelector,
    } from 'react-redux';
    // #endregion libraries


    // #region external
    import type {
        AppState,
        AppDispatch,
    } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
// #endregion module
