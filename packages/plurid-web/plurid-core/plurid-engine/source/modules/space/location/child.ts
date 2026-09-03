// #region imports
    // #region libraries
    import {
        TreePlane,
        TreePlaneLocation,
        LinkCoordinates,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
const DEG = Math.PI / 180;

export const DEFAULT_BRIDGE_LENGTH = 100;
export const DEFAULT_PLANE_ANGLE = 90;

export type PlaneFan =
    | 'alternate'
    | 'fixed';


/**
 * THE child-placement geometry, used by spawn, by link-coordinate updates, and by every relayout.
 *
 * The link sits on the parent plane at `linkCoordinates` (plane-local px from the parent's
 * top-left). From that point the bridge runs `bridgeLength` px at `planeAngle` degrees off the
 * parent's facing (about world Y), and the child plane starts where the bridge ends, turned by the
 * same angle — so the bridge, drawn along the child's local −X, always meets the link point.
 */
export const childLocation = (
    parent: TreePlaneLocation,
    linkCoordinates: LinkCoordinates,
    bridgeLength: number = DEFAULT_BRIDGE_LENGTH,
    planeAngle: number = DEFAULT_PLANE_ANGLE,
): TreePlaneLocation => {
    const parentAngle = parent.rotateY * DEG;
    const linkX = parent.translateX + linkCoordinates.x * Math.cos(parentAngle);
    const linkZ = parent.translateZ - linkCoordinates.x * Math.sin(parentAngle);
    const linkY = parent.translateY + linkCoordinates.y;

    const bridgeAngle = (parent.rotateY + planeAngle) * DEG;

    return {
        translateX: linkX + bridgeLength * Math.cos(bridgeAngle),
        translateY: linkY,
        translateZ: linkZ - bridgeLength * Math.sin(bridgeAngle),
        rotateX: parent.rotateX,
        rotateY: parent.rotateY + planeAngle,
    };
};


/**
 * The signed angle a spawned plane takes at a given depth (1 = a root's child). `alternate` (the
 * default) flips the sign every generation, so a grandchild turns back toward the root's facing
 * instead of ending up back-to-front at 180°; `fixed` keeps turning the same way.
 */
export const resolvePlaneAngle = (
    depth: number,
    _siblingIndex: number,
    configured: number = DEFAULT_PLANE_ANGLE,
    fan: PlaneFan = 'alternate',
): number => {
    if (fan === 'fixed') {
        return configured;
    }
    return depth % 2 === 1 ? configured : -configured;
};


const sameLocation = (
    a: TreePlaneLocation,
    b: TreePlaneLocation,
): boolean => a.translateX === b.translateX
    && a.translateY === b.translateY
    && a.translateZ === b.translateZ
    && a.rotateX === b.rotateX
    && a.rotateY === b.rotateY;


/**
 * Re-place every link-spawned descendant of `plane` from ITS current location (after a relayout,
 * a drag, a snap, or a link-coordinate change), recursively, including the children's facing.
 * Children that carry no link coordinates (host-authored subtrees) keep their location. Returns
 * the SAME reference when nothing moved, so structural sharing survives.
 */
export const recomputeSubtree = (
    plane: TreePlane,
): TreePlane => {
    if (!plane.children || plane.children.length === 0) {
        return plane;
    }

    let changed = false;
    const children = plane.children.map((child) => {
        let relocated = child;
        if (child.linkCoordinates) {
            const location = childLocation(
                plane.location,
                child.linkCoordinates,
                child.bridgeLength ?? DEFAULT_BRIDGE_LENGTH,
                child.planeAngle ?? DEFAULT_PLANE_ANGLE,
            );
            if (!sameLocation(location, child.location)) {
                relocated = {
                    ...child,
                    location,
                };
            }
        }

        const withChildren = recomputeSubtree(relocated);
        if (withChildren !== child) {
            changed = true;
        }
        return withChildren;
    });

    return changed
        ? { ...plane, children }
        : plane;
};


/** Re-place the descendants of every root. Same-reference when nothing moved. */
export const recomputeTree = (
    tree: TreePlane[],
): TreePlane[] => {
    let changed = false;
    const next = tree.map((root) => {
        const updated = recomputeSubtree(root);
        if (updated !== root) {
            changed = true;
        }
        return updated;
    });
    return changed ? next : tree;
};


/** Depth of a plane in the tree: 0 for a root, 1 for its child, … `-1` when absent. */
export const planeDepth = (
    tree: TreePlane[],
    planeID: string,
    depth = 0,
): number => {
    for (const plane of tree) {
        if (plane.planeID === planeID) {
            return depth;
        }
        if (plane.children && plane.children.length > 0) {
            const found = planeDepth(plane.children, planeID, depth + 1);
            if (found >= 0) {
                return found;
            }
        }
    }
    return -1;
};
// #endregion module
