// #region imports
    // #region libraries
    import {
        TreePlane,
        PlaneLink,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/** A root's identity across relayouts: its source and route (duplicates share one and pair in order). */
export const rootIdentity = (
    root: TreePlane,
): string => root.sourceID + '@' + root.route;

/**
 * Pair a recomputed tree's roots with the previous tree's by IDENTITY — never by location, a
 * relayout exists to move things: `take(root)` hands out the next unpaired previous root of that
 * identity, `remaining` holds the previous roots nobody took, by identity.
 */
export const pairRootsByIdentity = (
    previousTree: TreePlane[],
) => {
    const remaining = new Map<string, TreePlane[]>();
    for (const root of previousTree) {
        const key = rootIdentity(root);
        const list = remaining.get(key);
        if (list) {
            list.push(root);
        } else {
            remaining.set(key, [root]);
        }
    }
    return {
        take: (root: TreePlane): TreePlane | undefined => remaining.get(rootIdentity(root))?.shift(),
        remaining,
    };
};

/** A plane sized by hand (a resize handle): its size is its own and wins over every other source. */
export const isHandSized = (
    plane: TreePlane,
): boolean => plane.sizeMode === 'manual' && plane.width > 0;

/** A location is compared by value (a fresh object with the same five numbers is not a change). */
const sameField = (
    key: keyof TreePlane,
    a: unknown,
    b: unknown,
): boolean => {
    if (a === b) {
        return true;
    }
    if (key === 'location' && a && b) {
        const x = a as TreePlane['location'];
        const y = b as TreePlane['location'];
        return x.translateX === y.translateX && x.translateY === y.translateY && x.translateZ === y.translateZ
            && x.rotateX === y.rotateX && x.rotateY === y.rotateY;
    }
    return false;
};

/**
 * Patch fields on ONE plane, path-copying only the spine above it (structural sharing). Returns
 * the SAME tree reference when the plane is absent or every patched field is already `===`, so
 * callers can detect a no-op without diffing and connected planes keep their memo bailouts.
 */
export const updateTreePlaneFields = (
    tree: TreePlane[],
    planeID: string,
    patch: Partial<TreePlane>,
): TreePlane[] => {
    let changed = false;

    const updated = tree.map((plane) => {
        if (plane.planeID === planeID) {
            let differs = false;
            for (const key of Object.keys(patch) as (keyof TreePlane)[]) {
                if (!sameField(key, plane[key], patch[key])) {
                    differs = true;
                    break;
                }
            }
            if (!differs) {
                return plane;
            }
            changed = true;
            return {
                ...plane,
                ...patch,
            };
        }

        if (plane.children && plane.children.length > 0) {
            const children = updateTreePlaneFields(plane.children, planeID, patch);
            if (children !== plane.children) {
                changed = true;
                return {
                    ...plane,
                    children,
                };
            }
        }

        return plane;
    });

    return changed ? updated : tree;
};


const linkIndexes = new WeakMap<TreePlane[], Map<string, TreePlane>>();

const linkKey = (
    parentPlaneID: string,
    linkID: string,
): string => parentPlaneID + '#' + linkID;

/**
 * Every spawned plane by its parent and its link's stable id, built ONCE per tree reference: the
 * tree is structurally shared, so an unchanged tree keeps its index and a page of two hundred
 * links asks two hundred questions of one map rather than walking the tree two hundred times.
 */
export const linkIndexOf = (
    tree: TreePlane[],
): Map<string, TreePlane> => {
    const cached = linkIndexes.get(tree);
    if (cached) {
        return cached;
    }

    const index = new Map<string, TreePlane>();
    const walk = (planes: TreePlane[]) => {
        for (const plane of planes || []) {
            if (!plane) {
                continue;
            }
            for (const child of plane.children || []) {
                if (child?.spawnedByLinkID && !index.has(linkKey(plane.planeID, child.spawnedByLinkID))) {
                    index.set(linkKey(plane.planeID, child.spawnedByLinkID), child);
                }
            }
            walk(plane.children || []);
        }
    };
    walk(tree);
    linkIndexes.set(tree, index);
    return index;
};

/** The plane a link spawned, by the link's stable id, among the parent's children. */
export const findPlaneByLinkID = (
    tree: TreePlane[],
    parentPlaneID: string,
    linkID: string,
): TreePlane | undefined => linkIndexOf(tree).get(linkKey(parentPlaneID, linkID));


/** Drop the links whose endpoints are no longer in the tree. Same reference when nothing dangles. */
export const pruneLinks = (
    links: PlaneLink[],
    planeIDs: Set<string>,
): PlaneLink[] => {
    const kept = links.filter((link) => planeIDs.has(link.sourcePlaneID) && planeIDs.has(link.targetPlaneID));
    return kept.length === links.length ? links : kept;
};


/**
 * A closed plane is unmounted, so its measured size froze at the moment it closed. When the view
 * changes size, re-derive every hidden, non-manual plane's size from the fallback (its aspect ratio
 * kept when known) so bridges, the minimap and a later reopen start from a plausible size rather
 * than a stale one. Path-copies; the same array comes back when nothing changes.
 */
export const refreshHiddenPlaneSizes = (
    planes: TreePlane[],
    fallback: { width: number; height: number },
    /** the fallback height is configured (view-sized pages), not derived from the plane's aspect */
    exactHeight = false,
): TreePlane[] => {
    let changed = false;

    const next = planes.map((plane) => {
        const children = plane.children
            ? refreshHiddenPlaneSizes(plane.children, fallback, exactHeight)
            : undefined;
        const childrenChanged = !!children && children !== plane.children;

        const hidden = plane.show === false && plane.sizeMode !== 'manual' && plane.sizeMode !== 'declared';
        const resize = hidden && (plane.width !== fallback.width || (exactHeight && plane.height !== fallback.height));
        if (!resize && !childrenChanged) {
            return plane;
        }

        changed = true;
        const height = resize
            ? (exactHeight
                ? fallback.height
                : (plane.width > 0 && plane.height > 0
                    ? Math.round(fallback.width * plane.height / plane.width)
                    : fallback.height))
            : plane.height;

        return {
            ...plane,
            ...(resize ? { width: fallback.width, height } : {}),
            ...(childrenChanged ? { children } : {}),
        };
    });

    return changed ? next : planes;
};


export interface Leash {
    parent: TreePlane;
    child: TreePlane;
}

/**
 * The leashes to draw: every SHOWN child moved by hand (`manuallyPositioned`) that still hangs from
 * a link (`linkCoordinates`) under a shown parent — its bridge band would point nowhere, a segment
 * from the link's point to the child's edge is drawn instead — and every child whose bridge is a
 * leash by kind (`bridgeKind: 'leash'`: a later sibling of a fan, whose strip would cross its elders).
 */
export const collectLeashes = (
    tree: TreePlane[],
    into: Leash[] = [],
): Leash[] => {
    for (const parent of tree) {
        if (parent.show === false || !parent.children) {
            continue;
        }
        for (const child of parent.children) {
            if (child.show !== false && (child.manuallyPositioned || child.bridgeKind === 'leash') && child.linkCoordinates) {
                into.push({ parent, child });
            }
        }
        collectLeashes(parent.children, into);
    }
    return into;
};


/** Every plane id in the tree, children included. */
export const collectPlaneIDs = (
    tree: TreePlane[],
    into: Set<string> = new Set(),
): Set<string> => {
    for (const plane of tree) {
        into.add(plane.planeID);
        if (plane.children && plane.children.length > 0) {
            collectPlaneIDs(plane.children, into);
        }
    }
    return into;
};


/**
 * IS THIS A TREE THE SPACE CAN HOLD. `view.setTree` used to hand whatever it was given to the
 * store, and a malformed node threw inside a render, out of reach of the host that sent it.
 * Every node needs an id, a route, a location of five finite numbers, and children that are an
 * array of the same; sizes, when given, are finite numbers.
 */
export interface TreeValidation {
    ok: boolean;
    /** what was wrong with the first bad node, for the host's console */
    reason?: string;
}

export const validateTree = (
    tree: unknown,
): TreeValidation => {
    if (!Array.isArray(tree)) {
        return { ok: false, reason: 'a tree is an array of planes' };
    }

    const finite = (value: unknown) => typeof value === 'number' && Number.isFinite(value);

    const check = (nodes: unknown[], path: string): string | undefined => {
        for (let index = 0; index < nodes.length; index += 1) {
            const node = nodes[index] as Record<string, unknown> | null;
            const where = path + '[' + index + ']';
            if (!node || typeof node !== 'object') {
                return where + ' is not a plane';
            }
            if (typeof node.planeID !== 'string' || !node.planeID) {
                return where + ' has no planeID';
            }
            if (typeof node.route !== 'string' || !node.route) {
                return where + ' (' + node.planeID + ') has no route';
            }
            const location = node.location as Record<string, unknown> | undefined;
            if (!location || typeof location !== 'object') {
                return where + ' (' + node.planeID + ') has no location';
            }
            for (const field of ['translateX', 'translateY', 'translateZ', 'rotateX', 'rotateY']) {
                if (!finite(location[field])) {
                    return where + ' (' + node.planeID + ') location.' + field + ' is not a finite number';
                }
            }
            for (const field of ['width', 'height']) {
                if (node[field] !== undefined && !finite(node[field])) {
                    return where + ' (' + node.planeID + ') ' + field + ' is not a finite number';
                }
            }
            if (node.children !== undefined) {
                if (!Array.isArray(node.children)) {
                    return where + ' (' + node.planeID + ') children is not an array';
                }
                const deeper = check(node.children, where + '.children');
                if (deeper) {
                    return deeper;
                }
            }
        }
        return undefined;
    };

    const reason = check(tree, 'tree');
    return reason ? { ok: false, reason } : { ok: true };
};
// #endregion module
