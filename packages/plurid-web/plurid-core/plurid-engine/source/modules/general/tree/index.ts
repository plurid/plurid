// #region imports
    // #region libraries
    import {
        /** interfaces */
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export const updateTreePlane = (
    tree: TreePlane[],
    page: TreePlane,
): TreePlane[] => {
    const updatedTree = tree.map(treePlane => {
        if (treePlane.planeID === page.planeID) {
            return {
                ...page,
            };
        }

        if (treePlane.children) {
            return {
                ...treePlane,
                children: updateTreePlane(treePlane.children, page),
            };
        }

        return treePlane;
    });

    return updatedTree;
}



// #endregion module
