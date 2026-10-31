// #region imports
    import type { TreePlane, PluridPlanePinnable } from '@plurid/plurid-data';
// #endregion imports


// #region module

/** Runtime policies belong to the registration, never to saved tree nodes. */
export type PinRegistration = (sourceID: string) => { pinnable?: PluridPlanePinnable } | undefined;

export const allowsPin = (plane: TreePlane, registered?: PinRegistration): boolean => {
    const policy = registered?.(plane.sourceID)?.pinnable;
    if (typeof policy !== 'function') return policy !== false;
    try {
        return policy({
            planeID: plane.planeID,
            route: plane.route,
            parameters: {
                ...plane.routeDivisions?.path?.parameters,
                ...plane.routeDivisions?.plane?.parameters,
            },
        }) === true;
    } catch {
        // A host callback failure cannot move content that the host may consider unsafe.
        return false;
    }
};

/** Only shown instances may be newly pinned; hidden parents hide their children too. */
export const shownPinCandidate = (tree: readonly TreePlane[], planeID: string): TreePlane | undefined => {
    for (const plane of tree) {
        if (plane.show === false) continue;
        if (plane.planeID === planeID) return plane;
        const child = shownPinCandidate(plane.children || [], planeID);
        if (child) return child;
    }
    return undefined;
};

/** Remove refused pin state before the store can render or persist it, preserving identity. */
export const clearRefusedPins = (tree: TreePlane[], refused: ReadonlySet<string>): TreePlane[] => {
    let changed = false;
    const next = tree.map((plane) => {
        const children = plane.children && clearRefusedPins(plane.children, refused);
        const clear = !!plane.pinned && refused.has(plane.planeID);
        if (!clear && children === plane.children) return plane;
        changed = true;
        return { ...plane, ...(clear ? { pinned: undefined } : {}), ...(children ? { children } : {}) };
    });
    return changed ? next : tree;
};
// #endregion module
