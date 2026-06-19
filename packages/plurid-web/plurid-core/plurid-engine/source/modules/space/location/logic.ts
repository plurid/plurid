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

        while (parentID) {
            const parentPage = getTreePlaneByPlaneID(tree, parentID);
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
    treePageParent: TreePlane,
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
    page: TreePlane,
): TreePlane[] => {
    if (!page.children) {
        return [];
    }

    const updatedChildren: TreePlane[] = [];

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






/**
 * Compute translateX based on configuration layout if it exists
 * or based on the index of the root.
 *
 * @param configuration
 * @param root
 * @param index
 */
export const computeRootLocationX = <C>(
    configuration: PluridConfiguration | undefined,
    root: PluridPlane<C>,
    index: number,
) => {
    const rootData = resolvePluridPlaneData(root);
    // SSR-safe: `plurid-react-server` renders where `window` is undefined.
    const innerWidth = typeof window === 'undefined' ? 1440 : window.innerWidth;

    let translateX = 0;
    if (configuration && configuration.space) {
        // VESTIGIAL: `layout` used to be a `string[]` of routes; it is now an object, so this
        // branch never fires and per-route camera/center placement no-ops. Reworking it to
        // resolve a root's computed X from the active layout is a Phase D feature task.
        if (Array.isArray(configuration.space.layout)) {
            const layoutIndex = (configuration.space.layout as string[]).indexOf(rootData.route);
            translateX = innerWidth * layoutIndex + ROOTS_GAP * layoutIndex;
        }
    } else {
        translateX = index === 0
            ? 0
            : innerWidth * index + ROOTS_GAP * index;
    }

    return translateX;
}


export const computeSpaceLocation = (
    configuration: PluridConfiguration,
): SpaceLocation => {
    // if (configuration.space && configuration.space.layout) {
    //     const {
    //         layout,
    //     } = configuration.space;

    // }

    const cameraLocationX = computeCameraLocationX(configuration);
    const spaceLocation = {
        rotationX: 0,
        rotationY: 0,
        translationX: cameraLocationX,
        translationY: 0,
        translationZ: 0,
        scale: 1,
    };

    return spaceLocation;
}


/**
 * Based on the specified camera, compute the X translation
 *
 * @param configuration
 */
export const computeCameraLocationX = (
    configuration: PluridConfiguration,
) => {
    let translateX = 0;
    const innerWidth = typeof window === 'undefined' ? 1440 : window.innerWidth;

    // VESTIGIAL (see computeRootLocationX): `layout` is no longer a route array, so this never
    // fires and `space.camera` centering no-ops. Rework with the active layout in Phase D.
    if (configuration.space
        && Array.isArray(configuration.space.layout)
        && typeof configuration.space.camera === 'string'
    ) {
        const layoutIndex = (configuration.space.layout as string[]).indexOf(configuration.space.camera || '');
        translateX = innerWidth * layoutIndex + ROOTS_GAP * layoutIndex;
    }

    // account for camera space inversion
    return -1 * translateX;
}
// #endregion module
