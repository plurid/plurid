// #region imports
    // #region libraries
    import {
        /** constants */
        defaultTreePlane,

        /** interfaces */
        PluridInternalContextPlane,
        PluridInternalStatePlane,
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
    } from '../../router';
    // #endregion external
// #endregion imports



// #region module
export const createTreePlane = <C>(
    contextPlane: PluridInternalContextPlane<C>,
    documentPlane: PluridInternalStatePlane,
) => {
    const routeDivisions = pluridLinkPathDivider(contextPlane.path);
    // console.log('routeDivisions', routeDivisions);

    const treePlane: TreePlane = {
        ...defaultTreePlane,
        routeDivisions,
        sourceID: contextPlane.id,
        planeID: uuid.generate(),
        route: contextPlane.path,
        show: true,
    };
    return treePlane;
}


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
    const updatedTree = tree.map(treePlane => {
        if (treePlane.planeID === planeID) {
            const updatedPlane = {
                ...treePlane,
                linkCoordinates,
            };

            return updatedPlane;
        }

        if (treePlane.children) {
            const updatedChildren = updateTreeByPlaneIDWithLinkCoordinates(
                treePlane.children,
                planeID,
                linkCoordinates,
            );

            const updatedPlane = {
                ...treePlane,
                children: updatedChildren,
            };

            return updatedPlane;
        }

        return treePlane;
    });

    return updatedTree;
}
// #endregion module
