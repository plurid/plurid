// #region imports
    // #region libraries
    import type {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        planeAddressPath,
        routeSuffix,
    } from '~services/engine';

    import {
        planePath,
    } from '~services/logic/arrangement/fragment';
    // #endregion external
// #endregion imports



// #region module
/**
 * A PLANE NAMED BY ITS PATH (2026-10-30). An anchor names its plane as an arrangement fragment does
 * (`planePath`: the path with the query that is part of its identity), so a stop recorded in one
 * session finds its plane in the next, where every spawned plane has a new id.
 */

/** A path as an anchor holds it: a full plane address reads as its path; the query stays. */
export const anchorPath = (
    path: string,
): string => (planeAddressPath(path) || path) + routeSuffix(path);


/** A plane at a path, in tree order, and whether it (or a plane it hangs from) is hidden. */
export interface PlaneAtPath {
    plane: TreePlane;
    hidden: boolean;
}

/** Every plane at `path`, in tree order (each root, then what hangs from it). */
export const planesAtPath = (
    tree: TreePlane[],
    path: string,
): PlaneAtPath[] => {
    const wanted = anchorPath(path);
    const found: PlaneAtPath[] = [];
    const walk = (
        nodes: TreePlane[] | undefined,
        hiddenAbove: boolean,
    ) => {
        for (const node of nodes || []) {
            // a hidden plane hides what hangs from it: a child of a closed plane is not drawn
            const hidden = hiddenAbove || node.show === false;
            if (planePath(node) === wanted) {
                found.push({ plane: node, hidden });
            }
            walk(node.children, hidden);
        }
    };
    walk(tree, false);
    return found;
};

/** The plane's path and which plane at that path it is; `undefined` for an id the tree does not hold. */
export const planeIdentity = (
    tree: TreePlane[],
    planeID: string,
): { path: string; occurrence: number } | undefined => {
    let plane: TreePlane | undefined;
    const walk = (nodes: TreePlane[] | undefined) => {
        for (const node of nodes || []) {
            if (plane) {
                return;
            }
            if (node.planeID === planeID) {
                plane = node;
                return;
            }
            walk(node.children);
        }
    };
    walk(tree);
    if (!plane) {
        return undefined;
    }
    const path = planePath(plane);
    const occurrence = planesAtPath(tree, path).findIndex((entry) => entry.plane.planeID === planeID);
    return {
        path,
        occurrence: Math.max(0, occurrence),
    };
};
// #endregion module
