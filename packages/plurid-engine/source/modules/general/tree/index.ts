import {
    PluridInternalContextPlane,
    PluridInternalStatePlane,
    TreePlane,
    LinkCoordinates,
} from '@plurid/plurid-data';

import {
    uuid,
} from '@plurid/plurid-functions';



export const createTreePlane = (
    contextPlane: PluridInternalContextPlane,
    documentPlane: PluridInternalStatePlane,
) => {
    const treePlane: TreePlane = {
        sourceID: contextPlane.id,
        planeID: uuid.generate(),
        path: contextPlane.path,
        pathDivisions: {
            protocol: '',
            origin: {
                value: '',
                controlled: false,
            },
            route: {
                value: '',
                parameters: {},
                query: {},
            },
            space: {
                value: '',
                parameters: {},
                query: {},
            },
            universe: {
                value: '',
                parameters: {},
                query: {},
            },
            cluster: {
                value: '',
                parameters: {},
                query: {},
            },
            plane: {
                value: '',
                parameters: {},
                query: {},
            },
            valid: false,
        },
        height: 0,
        width: 0,
        location: {
            translateX: 0,
            translateY: 0,
            translateZ: 0,
            rotateX: 0,
            rotateY: 0,
        },
        // show: documentPlane.root,
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
