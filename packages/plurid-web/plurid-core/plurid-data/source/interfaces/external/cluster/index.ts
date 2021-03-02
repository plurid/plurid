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
export interface PluridCluster {
    id: string;
    name?: string;
    planes?: PluridPlane[];
    clusters?: PluridCluster[];
    layout?: PluridLayout;
}
// #endregion module
