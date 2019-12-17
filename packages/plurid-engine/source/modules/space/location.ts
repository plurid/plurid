import {
    /** interfaces */
    TreePage,
    LocationCoordinates,
    LinkCoordinates,
    TopPlanePoint,
} from '@plurid/plurid-data';

import {
    mathematics,
} from '@plurid/plurid-functions';

import {
    getTreePageByPlaneID,
} from './tree';



const toRadians = mathematics.geometry.toRadians;


export const computePath = (
    tree: TreePage[],
    planeID: string,
): TreePage[] => {
    let path: TreePage[] = [];
    const page = getTreePageByPlaneID(tree, planeID);

    if (page) {
        path.push( { ...page} );

        let parentID = page.parentPlaneID;
        if (!parentID) {
            return path;
        }

        while (parentID) {
            const parentPage = getTreePageByPlaneID(tree, parentID);
            if (parentPage) {
                const page = { ...parentPage };
                page.children = [];
                path.push(page);
                parentID = parentPage.parentPlaneID;
            }
        }
    }

    return path.reverse();
}


export const computePluridPlaneLocation = (
    linkCoordinates: LinkCoordinates,
    treePageParent: TreePage,
    bridgeLength: number = 100,
    linkPlaneAngle: number = 90,
): LocationCoordinates => {
    /** Compute the coordinates of the link. */
    const parentAngleRadians = toRadians(treePageParent.location.rotateY);
    const linkPoint: TopPlanePoint = {
        x: treePageParent.location.translateX + linkCoordinates.x * Math.cos(parentAngleRadians),
        z: treePageParent.location.translateZ - linkCoordinates.x * Math.sin(parentAngleRadians),
    };

    /** Compute the coordinates of the plane. */
    const linkAngleRadians = toRadians(linkPlaneAngle + treePageParent.location.rotateY);
    const x = linkPoint.x + bridgeLength * Math.cos(linkAngleRadians);
    const z = linkPoint.z - bridgeLength * Math.sin(linkAngleRadians);

    const y = treePageParent.location.translateY + linkCoordinates.y;

    const locationCoordinates: LocationCoordinates = {
        x,
        y,
        z,
    };

    return locationCoordinates;
}


export const recomputeChildrenLocation = (
    page: TreePage,
): TreePage[] => {
    if (!page.children) {
        return [];
    }

    const updatedChildren: TreePage[] = [];

    for (const child of page.children) {
        if (child.linkCoordinates) {
            const location = computePluridPlaneLocation(
                child.linkCoordinates,
                page,
                child.bridgeLength,
                child.planeAngle,
            );

            const updatedChild = {
                ...child,
                location: {
                    ...child.location,
                    translateX: location.x,
                    translateY: location.y,
                    translateZ: location.z,
                },
            };

            const children = updatedChild.children
                ? recomputeChildrenLocation(updatedChild)
                : [];

            const updatedChildWithChildren = {
                ...updatedChild,
                children,
            };

            updatedChildren.push(updatedChildWithChildren);
        }
    }

    return updatedChildren;
}
