// #region imports
    // #region libraries
    import {
        /** constants */
        ROOTS_GAP,

        /** interfaces */
        PluridPlane,
        PluridConfiguration,
        TreePlane,
        SpaceLocation,
        LocationCoordinates,
        LinkCoordinates,
        TopPlanePoint,
    } from '@plurid/plurid-data';

    import {
        mathematics,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        resolvePluridPlaneData,
    } from '~modules/planes';

    import {
        getTreePlaneByPlaneID,
    } from '../utilities';
    // #endregion external
    // #region internal
    import {
        childLocation,
        recomputeSubtree,
    } from './child';
    // #endregion internal
// #endregion imports



// #region module
const toRadians = mathematics.geometry.toRadians;


export const computePath = (
    tree: TreePlane[],
    planeID: string,
): TreePlane[] => {
    const path: TreePlane[] = [];
    const page = getTreePlaneByPlaneID(tree, planeID);

    if (page) {
        path.push( { ...page} );

        let parentID = page.parentPlaneID;
        if (!parentID) {
            return path;
        }

        // A dangling or cyclic `parentPlaneID` must not spin forever.
        const visited = new Set<string>([page.planeID]);
        while (parentID && !visited.has(parentID)) {
            visited.add(parentID);
            const parentPage = getTreePlaneByPlaneID(tree, parentID);
            if (!parentPage) {
                break;
            }
            const page = { ...parentPage };
            page.children = [];
            path.push(page);
            parentID = parentPage.parentPlaneID;
        }
    }

    return path.reverse();
}


/** @deprecated use `childLocation` (`./child`); kept as an exact wrapper. */
// #endregion module

