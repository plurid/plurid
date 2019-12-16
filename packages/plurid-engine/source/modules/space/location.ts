import {
    TreePage,
    LocationCoordinates,
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


interface PlanePoint {
    x: number,
    z: number,
}

export const computePluridPlaneLocation = (
    linkCoordinates: any,
    treePageParent: TreePage,
): LocationCoordinates => {
    const BRIDGE_LENGTH = 100;
    const LINK_PLANE_ANGLE = 90;

    const parentAngleRadians = toRadians(treePageParent.location.rotateY);
    const linkPoint: PlanePoint = {
        x: treePageParent.location.translateX + linkCoordinates.x * Math.cos(parentAngleRadians),
        z: treePageParent.location.translateZ - linkCoordinates.x * Math.sin(parentAngleRadians),
    };

    const linkAngleRadians = toRadians(LINK_PLANE_ANGLE + treePageParent.location.rotateY);
    const x = linkPoint.x + BRIDGE_LENGTH * Math.cos(linkAngleRadians);
    const z = linkPoint.z - BRIDGE_LENGTH * Math.sin(linkAngleRadians);

    const y = treePageParent.location.translateY + linkCoordinates.y;

    return {
        x,
        y,
        z,
    };
}
