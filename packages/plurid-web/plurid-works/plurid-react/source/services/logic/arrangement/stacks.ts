// #region imports
    import type { PluridStack, TreePlane } from '@plurid/plurid-data';
// #endregion imports


// #region module

/** Keep stack return placements only for existing, unpinned instances. Closed members stay. */
export const pruneStacks = (
    stacks: Record<string, PluridStack> | undefined,
    tree: readonly TreePlane[],
): Record<string, PluridStack> => {
    if (!stacks || typeof stacks !== 'object' || Array.isArray(stacks)) return {};
    const entries = Object.entries(stacks);
    if (!entries.length) return stacks;
    const present = new Set<string>();
    const visit = (nodes: readonly TreePlane[]) => {
        for (const node of nodes) {
            if (!node.pinned) present.add(node.planeID);
            visit(node.children || []);
        }
    };
    visit(tree);
    const claimed = new Set<string>();
    let changed = false;
    const result: Record<string, PluridStack> = {};
    for (const [id, stack] of entries) {
        if (!stack || stack.stackID !== id || !Array.isArray(stack.planeIDs) || !stack.previous) {
            changed = true;
            continue;
        }
        const ids: string[] = [];
        for (const planeID of stack.planeIDs) {
            if (ids.length === 12) break;
            const placement = stack.previous[planeID];
            const valid = present.has(planeID) && !claimed.has(planeID) && !!placement?.location
                && ['translateX', 'translateY', 'translateZ', 'rotateX', 'rotateY'].every((key) =>
                    Number.isFinite(placement.location[key as keyof typeof placement.location]))
                && (placement.manuallyPositioned === undefined || typeof placement.manuallyPositioned === 'boolean');
            if (valid) {
                claimed.add(planeID);
                ids.push(planeID);
            }
        }
        if (!ids.length) {
            changed = true;
            continue;
        }
        const same = ids.length === stack.planeIDs.length && Object.keys(stack.previous).length === ids.length;
        if (same) result[id] = stack;
        else {
            changed = true;
            result[id] = { ...stack, planeIDs: ids, previous: Object.fromEntries(ids.map((planeID) => [planeID, stack.previous[planeID]])) };
        }
    }
    return changed ? result : stacks;
};
// #endregion module
