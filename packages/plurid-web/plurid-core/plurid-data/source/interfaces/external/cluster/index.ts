// #region imports
    // #region external
    import {
        PluridPlane,
    } from '../plane';

    import {
        PluridLayout,
    } from '../layout';
    // #endregion external
// #endregion imports



// #region module
export interface PluridCluster<C> {
    id: string;
    name?: string;
    planes?: PluridPlane<C>[];
    clusters?: PluridCluster<C>[];
    layout?: PluridLayout;
}
// #endregion module
