// #region imports
    // #region libraries
    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        planeAddressPath,
        space as spaceEngine,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import {
        Arrangement,
        arrangementEntries,
        ArrangementEntry,
    } from './rebase';
    // #endregion internal
// #endregion imports



// #region module
/** What one plane's entry changed into, between two arrangements. */
type Change = 'opened' | 'closed' | 'removed' | 'added' | 'moved' | 'resized';

const ORDER: Change[] = ['removed', 'added', 'opened', 'closed', 'moved', 'resized'];

const VERB: Record<Change, string> = {
    removed: 'removed',
    added: 'added',
    opened: 'opened',
    closed: 'closed',
    moved: 'moved',
    resized: 'resized',
};

const changeOf = (
    before: ArrangementEntry | undefined,
    after: ArrangementEntry | undefined,
): Change | undefined => {
    if (!before) {
        return after ? 'added' : undefined;
    }
    if (!after) {
        return 'removed';
    }
    if (before.show !== after.show) {
        return after.show ? 'opened' : 'closed';
    }
    if (JSON.stringify(before.location) !== JSON.stringify(after.location)) {
        return 'moved';
    }
    if (JSON.stringify(before.size) !== JSON.stringify(after.size)) {
        return 'resized';
    }
    return undefined;
};

/** A plane's name in a label: its path, else its id (a node without a route is the id's). */
const nameOf = (
    arrangement: Arrangement,
    planeID: string,
): string => {
    const node: TreePlane | undefined = spaceEngine.tree.logic.getTreePlaneByID(arrangement.tree, planeID);
    return (node?.route ? planeAddressPath(node.route) : '') || planeID;
};


/**
 * WHAT AN ENTRY IS CALLED: the name of a history entry, derived from what the change did — never
 * authored, so it cannot drift from the arrangement. One plane by its path ("closed /geometry/detail"),
 * several by their count ("moved 3 planes"), a mixed change by the planes it touched ("arranged 2
 * planes"), the link graph on its own ("linked two planes"), and `'a change'` when nothing above fits.
 */
export const describeArrangementChange = (
    before: Arrangement,
    after: Arrangement,
): string => {
    const from = arrangementEntries(before);
    const to = arrangementEntries(after);

    const byChange = new Map<Change, string[]>();
    const ids = new Set([...from.planes.keys(), ...to.planes.keys()]);
    for (const id of ids) {
        const change = changeOf(from.planes.get(id), to.planes.get(id));
        if (!change) {
            continue;
        }
        byChange.set(change, [...(byChange.get(change) ?? []), id]);
    }

    const links = to.links.size - from.links.size;

    if (byChange.size === 0) {
        if (links > 0) {
            return links === 1 ? 'linked two planes' : 'added ' + links + ' links';
        }
        if (links < 0) {
            return links === -1 ? 'unlinked two planes' : 'removed ' + (-links) + ' links';
        }
        return 'a change';
    }

    if (byChange.size === 1) {
        const [change, planes] = [...byChange.entries()][0];
        if (planes.length === 1) {
            // a removed plane is only in the BEFORE arrangement
            const source = change === 'removed' ? before : after;
            return VERB[change] + ' ' + nameOf(source, planes[0]);
        }
        return VERB[change] + ' ' + planes.length + ' planes';
    }

    const touched = new Set<string>();
    for (const planes of byChange.values()) {
        for (const id of planes) {
            touched.add(id);
        }
    }
    // several kinds of change at once (a transaction): name the first kind and the count
    const first = ORDER.find((change) => byChange.has(change))!;
    return 'arranged ' + touched.size + ' planes (' + VERB[first] + ')';
};
// #endregion module
