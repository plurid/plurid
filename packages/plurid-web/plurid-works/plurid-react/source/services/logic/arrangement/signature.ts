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
 * A SIGNATURE of the authored arrangement — what a user can deliberately change, and nothing a
 * relayout touches on its own. It folds together:
 *   - structure: each plane's `planeID:show`
 *   - manual positions: a `manuallyPositioned` plane's rounded location
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
): string => {
    const parts: string[] = [];
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            let entry = node.planeID + ':' + (node.show ? 1 : 0);
            if (node.manuallyPositioned) {
                entry += ':' + Math.round(node.location.translateX)
                    + ',' + Math.round(node.location.translateY)
                    + ',' + Math.round(node.location.translateZ);
            }
            parts.push(entry);
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

    return parts.join('|') + '#' + linkSig;
}
// #endregion module
