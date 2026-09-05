// #region imports
    // #region libraries
    import {
        TreePlane,
        PlaneLink,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
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
                if (plane[key] !== patch[key]) {
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


/** The plane a link spawned, by the link's stable id, among the parent's children. */
export const findPlaneByLinkID = (
    tree: TreePlane[],
    parentPlaneID: string,
    linkID: string,
): TreePlane | undefined => {
    for (const plane of tree) {
        if (plane.planeID === parentPlaneID) {
            return (plane.children || []).find((child) => child.spawnedByLinkID === linkID);
        }
        if (plane.children && plane.children.length > 0) {
            const found = findPlaneByLinkID(plane.children, parentPlaneID, linkID);
            if (found) {
                return found;
            }
        }
    }
    return undefined;
};


/** Drop the links whose endpoints are no longer in the tree. Same reference when nothing dangles. */
export const pruneLinks = (
    links: PlaneLink[],
    planeIDs: Set<string>,
): PlaneLink[] => {
    const kept = links.filter((link) => planeIDs.has(link.sourcePlaneID) && planeIDs.has(link.targetPlaneID));
    return kept.length === links.length ? links : kept;
};


/** Every plane id in the tree, children included. */
/**
 * A closed plane is unmounted, so its measured size froze at the moment it closed. When the view
 * changes size, re-derive every hidden, non-manual plane's size from the fallback (its aspect ratio
 * kept when known) so bridges, the minimap and a later reopen start from a plausible size rather
 * than a stale one. Path-copies; the same array comes back when nothing changes.
 */
export const refreshHiddenPlaneSizes = (
    planes: TreePlane[],
    fallback: { width: number; height: number },
): TreePlane[] => {
    let changed = false;

    const next = planes.map((plane) => {
        const children = plane.children
            ? refreshHiddenPlaneSizes(plane.children, fallback)
            : undefined;
        const childrenChanged = !!children && children !== plane.children;

        const hidden = plane.show === false && plane.sizeMode !== 'manual' && plane.sizeMode !== 'declared';
        const resize = hidden && plane.width !== fallback.width;
        if (!resize && !childrenChanged) {
            return plane;
        }

        changed = true;
        const height = resize
            ? (plane.width > 0 && plane.height > 0
                ? Math.round(fallback.width * plane.height / plane.width)
                : fallback.height)
            : plane.height;

        return {
            ...plane,
            ...(resize ? { width: fallback.width, height } : {}),
            ...(childrenChanged ? { children } : {}),
        };
    });

    return changed ? next : planes;
};


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
// #endregion module
