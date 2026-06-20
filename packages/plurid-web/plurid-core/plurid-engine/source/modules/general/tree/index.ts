// #region imports
    // #region libraries
    import {
        /** constants */
        defaultTreePlane,

        /** interfaces */
        TreePlane,
        LinkCoordinates,
    } from '@plurid/plurid-data';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        pluridLinkPathDivider,
    } from '~modules/routing/logic';
    // #endregion external
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



export const updateTreeByPlaneIDWithLinkCoordinates = (
    tree: TreePlane[],
    planeID: string,
    linkCoordinates: LinkCoordinates,
): TreePlane[] => {
    // Structurally shared: only the node that matches `planeID` (and the spine of ancestors above
    // it) gets a new identity; unchanged siblings — and the array itself when nothing matched —
    // keep their references, so connected planes can bail out of re-rendering. The old version
    // rebuilt EVERY node that merely HAD children, breaking refs across the whole tree.
    let changed = false;

    const updatedTree = tree.map(treePlane => {
        if (treePlane.planeID === planeID) {
            changed = true;
            return {
                ...treePlane,
                linkCoordinates,
            };
        }

        if (treePlane.children) {
            const updatedChildren = updateTreeByPlaneIDWithLinkCoordinates(
                treePlane.children,
                planeID,
                linkCoordinates,
            );

            if (updatedChildren !== treePlane.children) {
                changed = true;
                return {
                    ...treePlane,
                    children: updatedChildren,
                };
            }
        }

        return treePlane;
    });

    return changed ? updatedTree : tree;
}
// #endregion module
