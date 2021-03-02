// #region imports
    // #region external
    import {
        PluridState,
    } from '../../internal/state';
    // #endregion external
// #endregion imports



// #region module
export type PluridMetastateState = Pick<
    PluridState,
    | 'configuration'
    | 'space'
    | 'ui'
>


export interface PluridMetastate {
    states: Record<string, PluridMetastateState>;
}
// #endregion module
