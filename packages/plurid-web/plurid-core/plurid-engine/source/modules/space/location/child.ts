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
/** The width a mirrored child is placed with before it has been measured. */
export const FALLBACK_CHILD_WIDTH = 400;

/** The edge a child's bridge leaves from: its left edge (`start`) or its right edge (`end`). */
export type BridgeSide =
    | 'start'
    | 'end';

export type PlaneFan =
    | 'alternate'
    | 'fixed';

/** Which way spawned planes grow from their parent: into the space behind it (the default) or toward the viewer. */
export type PlaneFanDirection =
    | 'backward'
    | 'forward';


/**
 * THE child-placement geometry, used by spawn, by link-coordinate updates, and by every relayout.
 *
 * The link sits on the parent plane at `linkCoordinates` (plane-local px from the parent's
 * top-left). From that point the bridge runs `bridgeLength` px at `planeAngle` degrees off the
 * parent's facing (about world Y), and the child plane starts where the bridge ends, turned by the
 * same angle — so the bridge, drawn along the child's local −X, always meets the link point.
 * With `bridgeSide: 'end'` the child is MIRRORED to the other side of the link: the bridge leaves
 * its right edge, so its origin sits `bridgeLength + childWidth` back along its own axis. That is
 * what puts an even generation behind its parent's face (see `resolveBridgeSide`).
 */
export const childLocation = (
    parent: TreePlaneLocation,
    linkCoordinates: LinkCoordinates,
    bridgeLength: number = DEFAULT_BRIDGE_LENGTH,
    planeAngle: number = DEFAULT_PLANE_ANGLE,
    bridgeSide: BridgeSide = 'start',
    childWidth: number = FALLBACK_CHILD_WIDTH,
): TreePlaneLocation => {
    const parentAngle = parent.rotateY * DEG;
    const linkX = parent.translateX + linkCoordinates.x * Math.cos(parentAngle);
    const linkZ = parent.translateZ - linkCoordinates.x * Math.sin(parentAngle);
    const linkY = parent.translateY + linkCoordinates.y;
    const bridgeAngle = (parent.rotateY + planeAngle) * DEG;
    const reach = bridgeSide === 'end'
        ? -(bridgeLength + (childWidth || FALLBACK_CHILD_WIDTH))
        : bridgeLength;
    return {
        translateX: linkX + reach * Math.cos(bridgeAngle),
        translateY: linkY,
        translateZ: linkZ - reach * Math.sin(bridgeAngle),
        rotateX: parent.rotateX,
        rotateY: parent.rotateY + planeAngle,
    };
};

/**
 * The edge a child's bridge leaves from, so that the child lies on its parent's FAR side — behind
 * the parent's face for `backward`, in front of it for `forward`. CSS `rotateY` turns a positive
 * `planeAngle` child's local +X behind the parent, so the ordinary left-edge bridge already puts
 * it there; a negative angle turns it in front, and only a bridge from the right edge — the plane
 * mirrored to the other side of the link — keeps it behind (`forward` is the exact opposite). The
 * alternating fan therefore mirrors every even generation: a grandchild faces the way its
 * grandparent does AND sits behind the fin it hangs from, instead of between the viewer and it
 * (the "mesh in front of detail" report, 2026-09-05).
 */
export const resolveBridgeSide = (
    planeAngle: number,
    direction: PlaneFanDirection = 'backward',
): BridgeSide => {
    const behind = Math.sin(planeAngle * DEG) > 0;
    const wanted = direction === 'backward';
    return behind === wanted ? 'start' : 'end';
};


/**
 * The signed angle a spawned plane takes at a given depth (1 = a root's child). The SIGN is what
 * places the child: CSS `rotateY(θ)` turns a plane's local +X toward −Z for a positive θ, so a
 * positive angle sends the bridge and the child away from the viewer (−Z, behind the parent's
 * face) and a negative one toward the viewer. `backward` (the default) starts positive: the space
 * is explored by going DEEPER, a chain opened from a wall of roots grows behind that wall — which
 * is why, in a wall layout, a grandchild can sit behind the neighbouring roots and be seen (and
 * clicked) only through the gaps between them until the camera goes around or in; `forward` starts
 * negative, the chain grows out of the wall toward the eye. `alternate` (the default fan) flips
 * the sign every generation, so a grandchild turns back parallel to its grandparent instead of
 * ending up back-to-front at 180°; `fixed` keeps turning the same way.
 */
export const resolvePlaneAngle = (
    depth: number,
    _siblingIndex: number,
    configured: number = DEFAULT_PLANE_ANGLE,
    fan: PlaneFan = 'alternate',
    direction: PlaneFanDirection = 'backward',
): number => {
    const first = direction === 'forward' ? -configured : configured;
    if (fan === 'fixed') {
        return first;
    }
    return depth % 2 === 1 ? first : -first;
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
                child.bridgeSide ?? 'start',
                child.width,
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
