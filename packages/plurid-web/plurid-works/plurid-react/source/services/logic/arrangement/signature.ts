// #region imports
    // #region libraries
    import {
        TreePlane,
        PlaneLink,
        PluridStack,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * A SIGNATURE of the authored arrangement — what a user can deliberately change, and nothing a
 * relayout touches on its own. It folds together:
 *   - structure: each plane's `planeID:show<parentPlaneID` (the parent is authored: a reparent is a change)
 *   - manual positions: a `manuallyPositioned` plane's rounded location
 *   - manual sizes: a hand-resized (`sizeMode: 'manual'`) plane's rounded size
 *   - screen pins: their rect, collapsed state and order
 *   - stacks: ordered members and their return placements
 *   - the link graph: each link's `id:source>target:kind`
 *
 * It DELIBERATELY excludes auto-layout positions. That single choice powers two features:
 *   - **undo** records one entry per real authoring change, never per relayout reflow;
 *   - **collaboration** emits a sync only on a real change, never a measurement storm.
 * Both consume this so they agree on exactly "what counts as a change".
 */
export const arrangementSignature = (
    tree: TreePlane[],
    links: PlaneLink[],
    stacks: Record<string, PluridStack> = {},
): string => {
    const parts: string[] = [];
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            // A node with no stable id can't be a meaningful signature entry — skip it (but still
            // recurse), so a malformed node can't collide with others as "undefined:…".
            if (node.planeID) {
                let entry = node.planeID + ':' + (node.show ? 1 : 0) + '<' + (node.parentPlaneID || '');
                if (node.manuallyPositioned) {
                    entry += ':' + Math.round(node.location.translateX)
                        + ',' + Math.round(node.location.translateY)
                        + ',' + Math.round(node.location.translateZ)
                        + ',' + node.location.rotateX + ',' + node.location.rotateY;
                }
                // A hand-resized plane's size is part of the arrangement too (undoable).
                if (node.sizeMode === 'manual') {
                    entry += ':' + Math.round(node.width) + 'x' + Math.round(node.height);
                }
                if (node.pinned) entry += ':pin:' + JSON.stringify(node.pinned);
                parts.push(entry);
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(Array.isArray(tree) ? tree : []);
    parts.sort();

    const linkSig = (Array.isArray(links) ? links : [])
        .map(link => link.id + ':' + link.sourcePlaneID + '>' + link.targetPlaneID + ':' + (link.kind || ''))
        .sort()
        .join('|');

    const stackSig = Object.keys(stacks).sort().map((id) => [id, stacks[id].planeIDs,
        stacks[id].planeIDs.map((planeID) => [planeID, stacks[id].previous[planeID]])]);
    return parts.join('|') + '#' + linkSig + '#' + JSON.stringify(stackSig);
}
// #endregion module
