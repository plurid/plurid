// #region imports
    // #region libraries
    import {
        /** interfaces */
        PluridView,
        TreePlane,
        SpaceLocation,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        findPage,
    } from '../utilities';
    // #endregion external
// #endregion imports



// #region module
export const computeViewTree = (
    pages: TreePlane[],
    view: string[] | PluridView[],
): TreePlane[] => {
    const viewTree: TreePlane[] = [];

    for (const pageView of view) {
        const page = pages.find(p => p.route === pageView);

        if (page) {
            viewTree.push(page);
        }
    }

    return viewTree;
}


/**
 * Compute only the view within a given radius around the user.
 *
 * @param pages
 * @param view
 * @param location
 */
// #endregion module

