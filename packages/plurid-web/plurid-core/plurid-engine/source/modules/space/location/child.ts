// #region imports
    // #region libraries
    import {
        TreePlane,
        TreePlaneLocation,
        LinkCoordinates,
        Vec3,
        PLANE_BAR_HEIGHT,
        BRIDGE_STRIP_HEIGHT,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        planeBasis,
    } from '../../interaction/camera/project';
    // #endregion external
// #endregion imports



// #region module
const DEG = Math.PI / 180;

export const DEFAULT_BRIDGE_LENGTH = 100;
/**
 * 90.1 AND NEVER 90: an exactly perpendicular plane is a zero-width quad that CSS 3D mishandles
 * (a hit test that misses, a paint that flickers). A tenth of a degree is invisible to a reader
 * and keeps every quad a quad. The camera does the reading work (`bestYaw`, `framePair`).
 */
export const DEFAULT_PLANE_ANGLE = 90.1;
/** the room between two siblings spawned from one parent, along the child's own width axis */
export const SIBLING_GAP = 50;
/** The width a mirrored child is placed with before it has been measured. */
export const FALLBACK_CHILD_WIDTH = 400;

/**
 * Where a spawned plane's top sits relative to its link's midline (`TreePlane.bridgeOffset`): the
 * plane's top is the top of its controls bar, and the bridge — one strip, centred on the link's
 * line — is flush with it. In the space presentation the bar is the plane's first row, so the plane
 * hangs half a strip above the link; on a page the bar hangs `PLANE_BAR_HEIGHT` above the sheet,
 * so the sheet sits that much lower.
 */
export const resolveBridgeOffset = (
    presentation: 'space' | 'page' | undefined,
): number => (presentation === 'page' ? PLANE_BAR_HEIGHT : 0) - BRIDGE_STRIP_HEIGHT / 2;

/** The edge a child's bridge leaves from: its left edge (`start`) or its right edge (`end`). */
export type BridgeSide =
    | 'start'
    | 'end';

export type PlaneFan =
    | 'fixed'
    | 'alternate';

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
    /** 0 (unmeasured) falls back to `FALLBACK_CHILD_WIDTH` */
    childWidth = 0,
    /** the plane's top relative to the link's midline (`resolveBridgeOffset`); 0 puts the top on the line */
    bridgeOffset = 0,
): TreePlaneLocation => {
    const link = linkWorldPoint(parent, linkCoordinates);
    const bridgeAngle = (parent.rotateY + planeAngle) * DEG;
    const reach = bridgeSide === 'end'
        ? -(bridgeLength + (childWidth || FALLBACK_CHILD_WIDTH))
        : bridgeLength;
    return {
        translateX: link.x + reach * Math.cos(bridgeAngle),
        translateY: link.y + bridgeOffset,
        translateZ: link.z - reach * Math.sin(bridgeAngle),
        rotateX: parent.rotateX,
        rotateY: parent.rotateY + planeAngle,
    };
};

export type BridgeAnchor =
    | 'link'
    | 'edge';

export type BridgeKind =
    | 'strip'
    | 'leash';

export interface SpawnAnchorOptions {
    /** the link's own point (`link`) or the parent's right edge at the link's height (`edge`) */
    anchor?: BridgeAnchor;
    /** how many siblings the parent already has from links: the i-th takes a longer bridge */
    ordinal?: number;
    /** the child's width, or 0 for the fallback: what a sibling's bridge grows by */
    childWidth?: number;
    bridgeLength?: number;
    gap?: number;
}

export interface SpawnAnchor {
    linkCoordinates: LinkCoordinates;
    bridgeLength: number;
    bridgeKind: BridgeKind;
}

/**
 * WHERE A SPAWNED CHILD HANGS FROM ITS PARENT, AND HOW FAR.
 *
 * A child at 90.1° anchored at the link's own point stands behind the part of its parent that is
 * to the right of the link: from the yaw between them, the parent's face covers the child's near
 * end. Anchored at the parent's RIGHT EDGE, at the link's height, the child stands one bridge
 * clear of the parent's silhouette, and from the bisecting yaw each projects to `cos 45.05°`
 * of its width with nothing over either (`bestYaw`).
 *
 * Siblings spawned from one parent used to coincide: same link point, same bridge, one on top of
 * another. The i-th sibling takes a bridge `length + i·(childWidth + gap)` long, which lays the
 * siblings along the child's own width axis, side by side from the reading yaw; the later ones
 * are drawn as leashes, since a strip from the parent's edge to the third sibling would cross the
 * first two.
 */
export const resolveSpawnAnchor = (
    parentWidth: number,
    link: LinkCoordinates,
    options: SpawnAnchorOptions = {},
): SpawnAnchor => {
    const anchor = options.anchor ?? 'link';
    const ordinal = Math.max(0, options.ordinal ?? 0);
    const length = options.bridgeLength ?? DEFAULT_BRIDGE_LENGTH;
    const width = options.childWidth || FALLBACK_CHILD_WIDTH;
    const gap = options.gap ?? SIBLING_GAP;

    return {
        linkCoordinates: anchor === 'edge' && parentWidth > 0
            ? { x: parentWidth, y: link.y }
            : link,
        bridgeLength: length + ordinal * (width + gap),
        bridgeKind: ordinal > 0 ? 'leash' : 'strip',
    };
};


/**
 * The link's point on the parent's face, in world space — where a child's bridge leaves from: the
 * parent's origin, the link's `x` along the parent's turned axis, the link's `y` down (a parent is
 * never pitched by a link).
 */
export const linkWorldPoint = (
    parent: TreePlaneLocation,
    linkCoordinates: LinkCoordinates,
): Vec3 => {
    const parentAngle = parent.rotateY * DEG;
    return {
        x: parent.translateX + linkCoordinates.x * Math.cos(parentAngle),
        y: parent.translateY + linkCoordinates.y,
        z: parent.translateZ - linkCoordinates.x * Math.sin(parentAngle),
    };
};

/**
 * The far end of a leash: the middle of the child's bridge-side edge at the link's line — the
 * bridge strip's centre, `bridgeOffset` above the plane's top (the plane is placed that much below
 * the line), on the right edge for a mirrored child (`bridgeSide: 'end'`).
 */
export const childLeashPoint = (
    child: Pick<TreePlane, 'location' | 'width' | 'bridgeSide' | 'bridgeOffset'>,
): Vec3 => {
    const basis = planeBasis(child.location);
    const along = child.bridgeSide === 'end' ? (child.width || FALLBACK_CHILD_WIDTH) : 0;
    const down = -(child.bridgeOffset ?? 0);
    return {
        x: basis.origin.x + basis.u.x * along + basis.v.x * down,
        y: basis.origin.y + basis.u.y * along + basis.v.y * down,
        z: basis.origin.z + basis.u.z * along + basis.v.z * down,
    };
};

/**
 * The edge a child's bridge leaves from, so that the child lies on its parent's FAR side — behind
 * the parent's face for `backward`, in front of it for `forward`. CSS `rotateY` turns a positive
 * `planeAngle` child's local +X behind the parent, so the ordinary left-edge bridge already puts
 * it there; a negative angle turns it in front, and only a bridge from the right edge — the plane
 * mirrored to the other side of the link — keeps it behind (`forward` is the exact opposite). The
 * alternating fan therefore mirrors every even generation: a grandchild faces the way its
 * grandparent does AND sits behind the fin it hangs from, instead of between the viewer and it.
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
 * negative, the chain grows out of the wall toward the eye. `fixed` (the default fan) applies the
 * same turn every generation — each child 90° to the right of its parent, behind its parent's
 * face, exactly like the first link off a root; `alternate` flips
 * the sign every generation, so a grandchild turns back parallel to its grandparent (and then
 * hangs on the side its parent faces, see `resolveBridgeSide`).
 */
export const resolvePlaneAngle = (
    depth: number,
    configured: number = DEFAULT_PLANE_ANGLE,
    fan: PlaneFan = 'fixed',
    direction: PlaneFanDirection = 'backward',
): number => {
    const first = direction === 'forward' ? -configured : configured;
    if (fan === 'fixed') {
        return first;
    }
    return depth % 2 === 1 ? first : -first;
};


/**
 * The coordinates a child's bridge leaves from, as its anchor says: a child anchored at the edge
 * follows the parent's right edge when the parent is resized, whatever x it was spawned with.
 */
export const anchoredCoordinates = (
    parent: Pick<TreePlane, 'width'>,
    child: Pick<TreePlane, 'linkCoordinates' | 'bridgeAnchor'>,
): LinkCoordinates => {
    const link = child.linkCoordinates || { x: 0, y: 0 };
    return child.bridgeAnchor === 'edge' && parent.width > 0
        ? { x: parent.width, y: link.y }
        : link;
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
 * Children that carry no link coordinates (host-authored subtrees) and children the user PINNED
 * (`manuallyPositioned`: a dragged child stays where it was dropped) keep their
 * location — their own descendants still follow them. Returns the SAME reference when nothing
 * moved, so structural sharing survives.
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
        if (child.linkCoordinates && !child.manuallyPositioned) {
            const location = childLocation(
                plane.location,
                anchoredCoordinates(plane, child),
                child.bridgeLength ?? DEFAULT_BRIDGE_LENGTH,
                child.planeAngle ?? DEFAULT_PLANE_ANGLE,
                child.bridgeSide ?? 'start',
                child.width,
                child.bridgeOffset ?? 0,
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
