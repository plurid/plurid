// #region imports
    // #region libraries
    import {
        TreePlane,
        PlaneLink,
        PluridStack,
        PluridPinnedState,
        TreePlaneLocation,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        space as spaceEngine,
    } from '~services/engine';
    import { pruneStacks } from './stacks';
    // #endregion external
// #endregion imports



// #region module
/**
 * What a user can deliberately change about one plane — the per-plane half of `arrangementSignature`,
 * less the parent: a reparent is not replayed (see `rebaseSnapshot`).
 */
export interface ArrangementEntry {
    show: boolean;
    /** The pinned location (`manuallyPositioned`). */
    location?: { x: number; y: number; z: number; rotateX?: number; rotateY?: number };
    pinned?: PluridPinnedState;
    /** Kept for restoring a manual placement to layout ownership, excluded from equality. */
    automaticLocation?: TreePlaneLocation;
    /** The hand-set size (`sizeMode: 'manual'`). */
    size?: { width: number; height: number };
}

export interface Arrangement {
    tree: TreePlane[];
    links: PlaneLink[];
    stacks?: Record<string, PluridStack>;
}

export interface ArrangementDiff {
    /** Per plane: its entry in the target, or `null` when the target has no such plane. */
    planes: Map<string, ArrangementEntry | null>;
    links: {
        added: PlaneLink[];
        removed: string[];
    };
    stacks?: Map<string, PluridStack | null>;
    empty: boolean;
}

const linkKey = (
    link: PlaneLink,
): string => link.id + ':' + link.sourcePlaneID + '>' + link.targetPlaneID + ':' + (link.kind || '');

const entryOf = (
    node: TreePlane,
): ArrangementEntry => ({
    show: node.show !== false,
    ...(node.pinned ? { pinned: node.pinned } : {}),
    ...(!node.manuallyPositioned && node.location ? { automaticLocation: node.location } : {}),
    ...(node.manuallyPositioned && node.location
        ? { location: { x: node.location.translateX, y: node.location.translateY, z: node.location.translateZ, rotateX: node.location.rotateX, rotateY: node.location.rotateY } }
        : {}),
    ...(node.sizeMode === 'manual'
        ? { size: { width: node.width, height: node.height } }
        : {}),
});

const sameEntry = (
    a: ArrangementEntry,
    b: ArrangementEntry,
): boolean => a.show === b.show
    && (!!a.location === !!b.location)
    && (!a.location || !b.location || (
        Math.round(a.location.x) === Math.round(b.location.x)
        && Math.round(a.location.y) === Math.round(b.location.y)
        && Math.round(a.location.z) === Math.round(b.location.z)
        && (a.location.rotateX ?? 0) === (b.location.rotateX ?? 0)
        && (a.location.rotateY ?? 0) === (b.location.rotateY ?? 0)
    ))
    && JSON.stringify(a.pinned) === JSON.stringify(b.pinned)
    && (!!a.size === !!b.size)
    && (!a.size || !b.size || (
        Math.round(a.size.width) === Math.round(b.size.width)
        && Math.round(a.size.height) === Math.round(b.size.height)
    ));

/** The arrangement as per-plane entries and per-link records (the three-way merge's vocabulary). */
export const arrangementEntries = (
    arrangement: Arrangement,
): { planes: Map<string, ArrangementEntry>; links: Map<string, PlaneLink> } => {
    const planes = new Map<string, ArrangementEntry>();
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            if (node.planeID) {
                planes.set(node.planeID, entryOf(node));
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(Array.isArray(arrangement.tree) ? arrangement.tree : []);
    const links = new Map<string, PlaneLink>();
    for (const link of Array.isArray(arrangement.links) ? arrangement.links : []) {
        links.set(linkKey(link), link);
    }
    return { planes, links };
};

/** What restoring `to` from `from` changes: the planes whose entries differ (or vanish), the links added and removed. */
export const diffArrangement = (
    from: Arrangement,
    to: Arrangement,
): ArrangementDiff => {
    const before = arrangementEntries(from);
    const after = arrangementEntries(to);
    const planes = new Map<string, ArrangementEntry | null>();
    for (const [id, entry] of after.planes) {
        const previous = before.planes.get(id);
        if (!previous || !sameEntry(previous, entry)) {
            planes.set(id, entry);
        }
    }
    for (const id of before.planes.keys()) {
        if (!after.planes.has(id)) {
            planes.set(id, null);
        }
    }
    const added: PlaneLink[] = [];
    for (const [key, link] of after.links) {
        if (!before.links.has(key)) {
            added.push(link);
        }
    }
    const removed: string[] = [];
    for (const key of before.links.keys()) {
        if (!after.links.has(key)) {
            removed.push(key);
        }
    }
    const stacks = new Map<string, PluridStack | null>();
    for (const id of new Set([...Object.keys(from.stacks || {}), ...Object.keys(to.stacks || {})])) {
        const previous = from.stacks?.[id], next = to.stacks?.[id];
        if (JSON.stringify(previous) !== JSON.stringify(next)) stacks.set(id, next ?? null);
    }
    return {
        planes,
        links: { added, removed },
        stacks,
        empty: planes.size === 0 && added.length === 0 && removed.length === 0 && stacks.size === 0,
    };
};

/**
 * The local changes replayed over another arrangement: a plane the diff names is set to the diff's
 * entry (shown or hidden, its pin, its hand-set size) when the base still has it, removed when the
 * diff removes it; a plane the base no longer has is left out (the peer's removal stands); the links
 * follow, pruned to the planes that exist. Structural sharing survives: an untouched subtree keeps
 * its reference, and a no-op returns the base itself.
 */
export const applyArrangementDiff = (
    base: Arrangement,
    diff: ArrangementDiff,
): Arrangement => {
    let tree = base.tree;
    for (const [id, entry] of diff.planes) {
        const current = spaceEngine.tree.logic.getTreePlaneByID(tree, id);
        if (!current) {
            continue;
        }
        if (entry === null) {
            tree = spaceEngine.tree.logic.removePlaneFromTree(tree, id);
            continue;
        }
        if (sameEntry(entryOf(current), entry)) {
            continue;
        }
        const patch: Partial<TreePlane> = {
            show: entry.show,
            pinned: entry.pinned,
            manuallyPositioned: !!entry.location,
            ...(!entry.location && entry.automaticLocation ? { location: entry.automaticLocation } : {}),
            ...(entry.location
                ? {
                    manuallyPositioned: true,
                    location: {
                        ...current.location,
                        translateX: entry.location.x,
                        translateY: entry.location.y,
                        translateZ: entry.location.z,
                        rotateX: entry.location.rotateX ?? 0,
                        rotateY: entry.location.rotateY ?? 0,
                    },
                }
                : {}),
            ...(entry.size
                ? { sizeMode: 'manual' as const, width: entry.size.width, height: entry.size.height }
                : {}),
        };
        tree = spaceEngine.tree.fields.updateTreePlaneFields(tree, id, patch);
    }
    const removed = new Set(diff.links.removed);
    const baseLinks = Array.isArray(base.links) ? base.links : [];
    let links = base.links;
    if (removed.size > 0 || diff.links.added.length > 0) {
        const kept = baseLinks.filter((link) => !removed.has(linkKey(link)));
        const present = new Set(kept.map(linkKey));
        const added = diff.links.added.filter((link) => !present.has(linkKey(link)));
        const next = [...kept, ...added];
        links = spaceEngine.tree.fields.pruneLinks(next, spaceEngine.tree.fields.collectPlaneIDs(tree));
        if (links.length === baseLinks.length && links.every((link, index) => link === baseLinks[index])) {
            links = base.links;
        }
    }
    let stacks = base.stacks;
    if (diff.stacks?.size) {
        const local = Object.fromEntries([...diff.stacks].filter((entry): entry is [string, PluridStack] => entry[1] !== null));
        const untouched = Object.fromEntries(Object.entries(base.stacks || {}).filter(([id]) => !diff.stacks!.has(id)));
        // Local stack membership wins on the members it changes; unrelated peer stacks survive.
        stacks = { ...local, ...untouched };
    }
    if (stacks && (tree !== base.tree || stacks !== base.stacks)) stacks = pruneStacks(stacks, tree);
    return tree === base.tree && links === base.links && stacks === base.stacks
        ? base : { tree, links, ...(stacks ? { stacks } : {}) };
};

/**
 * REBASED UNDO: a snapshot recorded before a peer's change, replayed over the peer's arrangement —
 * `apply(remote, diff(before, snapshot))`, `before` being the arrangement the peer's change
 * replaced. The local diff wins on the planes it touches; the peer's work stands everywhere else.
 * `null` when nothing local survives (the snapshot is dropped). Two limits, by design: a reparent
 * is not replayed (the entry carries no parent — a plane keeps the parent the peer's arrangement
 * gives it), and a plane the peer removed is not brought back (its entry is left out).
 */
export const rebaseSnapshot = (
    snapshot: Arrangement,
    before: Arrangement,
    remote: Arrangement,
): Arrangement | null => {
    const diff = diffArrangement(before, snapshot);
    if (diff.empty) {
        return null;
    }
    const rebased = applyArrangementDiff(remote, diff);
    return rebased === remote ? null : rebased;
};
// #endregion module
