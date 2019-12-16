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
const toDegrees = mathematics.geometry.toDegrees;


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


interface Point {
    x: number,
    z: number,
}

const computeDistanceBetweenPoints = (
    point1: Point,
    point2: Point,
): number => {
    const distance = Math.sqrt(
        Math.pow((point2.x - point1.x), 2)
        + Math.pow((point2.z - point1.z), 2)
    );
    return distance;
}


const computeLocationXYZ = (
    linkCoordinates: any,
    treePageParent: TreePage,
    // path: TreePage[],
): LocationCoordinates => {
    console.log('linkCoordinates', linkCoordinates);
    console.log('treePageParent', treePageParent);
    // console.log('path', path);

    const BRIDGE_LENGTH = 100;
    const LINK_PLANE_ANGLE = 90;

    const y = treePageParent.location.translateY + linkCoordinates.y;
    let x = 0;
    let z = 0;

    const origin: Point = {
        x: 0,
        z: 0,
    };

    const parentPlanePoint: Point = {
        x: treePageParent.location.translateX,
        z: treePageParent.location.translateZ,
    };
    // console.log('parentPlanePoint', parentPlanePoint);

    const distanceOriginParentPlane = computeDistanceBetweenPoints(
        origin,
        parentPlanePoint,
    );
    console.log('distanceOriginParentPlane', distanceOriginParentPlane);

    const parentAngleRadians = toRadians(treePageParent.location.rotateY);
    const linkPoint: Point = {
        x: treePageParent.location.translateX + linkCoordinates.x * Math.cos(parentAngleRadians),
        z: treePageParent.location.translateZ - linkCoordinates.x * Math.sin(parentAngleRadians),
    };
    console.log('linkPoint', linkPoint);

    // const distanceParentPlaneLink = computeDistanceBetweenPoints(
    //     parentPlanePoint,
    //     linkPoint,
    // );
    // console.log('distanceParentPlaneLink', distanceParentPlaneLink);

    // const distanceOriginLink = computeDistanceBetweenPoints(
    //     origin,
    //     linkPoint,
    // );
    // console.log('distanceOriginLink', distanceOriginLink);

    // const distanceParentPlaneLinkPlane = Math.sqrt(
    //     Math.pow(distanceParentPlaneLink, 2)
    //     + Math.pow(BRIDGE_LENGTH, 2)
    //     - 2 * distanceParentPlaneLink * BRIDGE_LENGTH * Math.cos(toRadians(LINK_PLANE_ANGLE))
    // );
    // console.log('distanceParentPlaneLinkPlane', distanceParentPlaneLinkPlane);

    const linkPlaneX = linkPoint.x + BRIDGE_LENGTH * Math.cos(toRadians(LINK_PLANE_ANGLE + treePageParent.location.rotateY));
    const linkPlaneZ = linkPoint.z - BRIDGE_LENGTH * Math.sin(toRadians(LINK_PLANE_ANGLE + treePageParent.location.rotateY));

    // console.log('x y z', x, y, z);
    // console.log('---------------------');

    return {
        x: linkPlaneX,
        y,
        z: linkPlaneZ,
    };
}


export const computePluridPlaneLocation = (
    tree: TreePage[],
    linkCoordinates: any,
    treePageParent: TreePage,
    treePageParentPlaneID: string,
): LocationCoordinates => {
    // const path = computePath(tree, treePageParentPlaneID);

    return computeLocationXYZ(
        linkCoordinates,
        treePageParent,
        // path,
    );



    // // let prevLinkX = treePageParent.location.translateX;
    // // let rotXbranch = 90 + treePageParent.location.rotateY;
    // let prevTransX = treePageParent.location.translateX;
    // // let prevTransY = treePageParent.location.translateY;
    // let prevTransZ = treePageParent.location.translateZ;
    // // let penultimateRootAngleYRad = treePageParent.location.rotateY * Math.PI / 180;

    // const linkX = linkCoordinates.x;
    // const bridgeLength = 100;
    // const hyp = Math.sqrt(Math.pow(linkX, 2) + Math.pow(bridgeLength, 2));
    // console.log('hyp', hyp);
    // const sinHyp = bridgeLength / hyp;
    // console.log('sinHyp', sinHyp);
    // const asinHyp = Math.asin(sinHyp);
    // console.log('asinHyp', asinHyp);
    // const sinDeg = toDegrees(asinHyp);
    // console.log('sinDeg', sinDeg);

    // const cosHyp = linkX / hyp;
    // console.log('cosHyp', cosHyp);
    // const acosHyp = Math.acos(cosHyp);
    // console.log('acosHyp', acosHyp);
    // const cosDeg = toDegrees(acosHyp);
    // console.log('cosDeg', cosDeg);

    // const sinDegTotal = sinDeg + treePageParent.location.rotateY;
    // console.log('sinDegTotal', sinDegTotal);
    // const cosDegTotal = cosDeg + treePageParent.location.rotateY;
    // console.log('cosDegTotal', cosDegTotal);

    // const sinTotal = Math.sin(toRadians(sinDegTotal));
    // // const sinTotal = sinHyp + Math.sin(toRadians(treePageParent.location.rotateY));
    // console.log('sinTotal', sinTotal);
    // const cosTotal = Math.cos(toRadians(cosDegTotal));
    // // const cosTotal = cosHyp + Math.cos(toRadians(treePageParent.location.rotateY));
    // console.log('cosTotal', cosTotal);

    // x = cosTotal * (hyp + prevTransX);
    // z = sinTotal * (hyp + prevTransZ);

    // console.log('treePageParent.location', treePageParent.location);
    // console.log(linkCoordinates);

    // x = Math.cos(toRadians(treePageParent.location.rotateY)) * linkCoordinates.x;
    // z = -1 * Math.sin(toRadians(treePageParent.location.rotateY)) * linkCoordinates.x - bridgeLength;

    // if (path.length < 2) {
    //     console.log('path length under 2');
    //     x = (prevTransX + linkCoordinates.x) * Math.cos(toRadians(rotXbranch));
    //     z = -1 * bridgeLength * Math.sin(toRadians(rotXbranch));
    // }

    // if (path.length === 2) {
    //     console.log('path length 2');
    //     x = (prevLinkX - bridgeLength) + (linkCoordinates.x + bridgeLength) * Math.cos(rotXbranch * Math.PI / 180);
    //     z = -1 * (linkCoordinates.x + bridgeLength) * Math.sin(rotXbranch * Math.PI / 180);
    // }

    // if (path.length === 3) {
    //     console.log('path length 3');

    //     x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    //     z = (prevTransZ + bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    // }

    // if (path.length === 4) {
    //     // console.log('path length 4');

    //     x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    //     z = (Math.abs(prevTransZ) + bridgeLength) + Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    // }

    // if (path.length === 5) {
    //     // console.log('path length 5');

    //     x = (prevTransX - bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    //     z = -1 * ( (Math.abs(prevTransZ) + bridgeLength) + Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength) );
    // }

    // if (path.length === 6) {
    //     // console.log('path length 6');

    //     x = (prevTransX - bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    //     z = (prevTransZ + bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    // }

    // if (path.length === 7) {
    //     // console.log('path length 7');

    //     x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    //     z = (prevTransZ + bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    // }

    // if (path.length === 8) {
    //     // console.log('path length 8');

    //     x = (prevTransX + bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    //     z = (prevTransZ - bridgeLength) - Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    // }

    // if (path.length === 9) {
    //     // console.log('path length 9 is as 5');

    //     x = (prevTransX - bridgeLength) + Math.cos(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength);
    //     z = -1 * ( (Math.abs(prevTransZ) + bridgeLength) + Math.sin(penultimateRootAngleYRad) * (linkCoordinates.x + bridgeLength) );
    // }
}
