// #region imports
    // #region libraries
    import {
        TreePlane,
        TreePlaneLocation,
        LinkCoordinates,
        PlaneLink,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        space as spaceEngine,
        routeSuffix,
        planeAddressPath,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE ARRANGEMENT FRAGMENT: a piece of a space, as text. What the clipboard carries between two
 * plurid applications — another tab, another window, another site, a chat message — and what a copy,
 * a cut and a paste are all defined in terms of.
 *
 * A PLANE'S IDENTITY IS ITS PATH, and nothing else. Not its `planeID`, which is local to the space
 * that made it (a uuid); not its full address, which carries the HOST it was copied from — a
 * fragment cut on one site pastes on another, and the planes it names are the target's own. So the
 * fragment is a FORMAT, not a memory dump: a path, where the plane sat, how big it was, and how a
 * child hung off its parent. A paste asks the target to make each path into a plane the way OPENING
 * it would (the same `resolveViewItem` a link goes through), then places what comes back. A path
 * the target does not register cannot become a plane there: it is dropped with its subtree and its
 * links, and named in `dropped` so the caller can say so out loud.
 *
 * The text is JSON with a marker and a version, so a paste can tell an arrangement from any other
 * text on the clipboard (a paste of ordinary text does nothing here and stays the page's), and a
 * later shape is recognised and refused rather than half-read.
 */
export const FRAGMENT_MARKER = 'plurid/arrangement';
export const FRAGMENT_VERSION = 1;


export interface FragmentPlane {
    /** An id WITHIN the fragment, so its links can name it. Never a plane id of any space. */
    id: string;
    /** THE IDENTITY: the path with its query, exactly as a link would ask for it (`/docs?x=1`). */
    path: string;
    location: TreePlaneLocation;
    width: number;
    height: number;
    sizeMode?: TreePlane['sizeMode'];
    manuallyPositioned?: boolean;
    /** A child's own spawn geometry, so a pasted subtree hangs exactly as it hung. */
    bridge?: {
        length?: number;
        side?: 'start' | 'end';
        offset?: number;
        angle?: number;
        coordinates?: LinkCoordinates;
    };
    /**
     * What follows the parent's id in the id of the link that spawned it (`#<route>#<ordinal>`), so
     * the pasted parent's own link owns the pasted child. Absent when the link declared an id of its
     * own: two planes cannot answer to one link id, so the copy simply keeps none.
     */
    linkSuffix?: string;
    children?: FragmentPlane[];
}

export interface FragmentLink {
    sourceID: string;
    targetID: string;
    kind?: string;
    sourceAnchor?: PlaneLink['sourceAnchor'];
    targetAnchor?: PlaneLink['targetAnchor'];
}

export interface ArrangementFragment {
    plurid: typeof FRAGMENT_MARKER;
    version: number;
    /** The copied planes, each a ROOT of its own subtree (a child copied alone becomes a root). */
    planes: FragmentPlane[];
    /** The links among the copied planes only — an edge to a plane left behind does not travel. */
    links: FragmentLink[];
    /** Where it was copied from. Never trusted for anything: a label for a host that wants one. */
    origin?: {
        host: string;
        at: number;
    };
}


/** The path a link would ask for: the plane's own path, with the query that is part of its identity. */
export const planePath = (
    plane: TreePlane,
): string => (planeAddressPath(plane.route) || plane.route) + routeSuffix(plane.route);


/** The planes of a subtree, deepest included, as one flat list. */
const flatten = (
    nodes: TreePlane[],
    into: TreePlane[] = [],
): TreePlane[] => {
    for (const node of nodes) {
        into.push(node);
        if (node.children) {
            flatten(node.children, into);
        }
    }
    return into;
};


const describePlane = (
    plane: TreePlane,
    parent: TreePlane | undefined,
): FragmentPlane => {
    const bridge = {
        ...(plane.bridgeLength !== undefined ? { length: plane.bridgeLength } : {}),
        ...(plane.bridgeSide !== undefined ? { side: plane.bridgeSide } : {}),
        ...(plane.bridgeOffset !== undefined ? { offset: plane.bridgeOffset } : {}),
        ...(plane.planeAngle !== undefined ? { angle: plane.planeAngle } : {}),
        ...(plane.linkCoordinates !== undefined ? { coordinates: plane.linkCoordinates } : {}),
    };
    const spawned = parent && plane.spawnedByLinkID && plane.spawnedByLinkID.startsWith(parent.planeID + '#')
        ? plane.spawnedByLinkID.slice(parent.planeID.length)
        : undefined;

    return {
        id: plane.planeID,
        path: planePath(plane),
        location: { ...plane.location },
        width: plane.width,
        height: plane.height,
        ...(plane.sizeMode ? { sizeMode: plane.sizeMode } : {}),
        ...(plane.manuallyPositioned ? { manuallyPositioned: true } : {}),
        // a ROOT of the fragment has no parent there: its bridge geometry was its parent's doing
        ...(parent && Object.keys(bridge).length > 0 ? { bridge } : {}),
        ...(spawned ? { linkSuffix: spawned } : {}),
        ...(plane.children && plane.children.length > 0
            ? { children: plane.children.map((child) => describePlane(child, plane)) }
            : {}),
    };
};


/**
 * A COPY of the named planes: each one with its subtree and the links among the whole set. `null`
 * when nothing nameable was selected, so a caller can leave the clipboard alone.
 */
export const fragmentOf = (
    tree: TreePlane[],
    planeIDs: string[],
    links: PlaneLink[] = [],
    origin?: string,
): ArrangementFragment | null => {
    const wanted = new Set(planeIDs);
    const roots: TreePlane[] = [];
    /** The outermost selected node of each branch: a selected child of a selected parent travels inside it. */
    const walk = (
        nodes: TreePlane[],
    ) => {
        for (const node of nodes) {
            if (wanted.has(node.planeID)) {
                roots.push(node);
                continue;
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(tree);

    if (roots.length === 0) {
        return null;
    }

    const copied = new Set(flatten(roots).map((plane) => plane.planeID));

    return {
        plurid: FRAGMENT_MARKER,
        version: FRAGMENT_VERSION,
        planes: roots.map((root) => describePlane(root, undefined)),
        links: links
            .filter((link) => copied.has(link.sourcePlaneID) && copied.has(link.targetPlaneID))
            .map((link) => ({
                sourceID: link.sourcePlaneID,
                targetID: link.targetPlaneID,
                ...(link.kind ? { kind: link.kind } : {}),
                ...(link.sourceAnchor ? { sourceAnchor: link.sourceAnchor } : {}),
                ...(link.targetAnchor ? { targetAnchor: link.targetAnchor } : {}),
            })),
        ...(origin ? { origin: { host: origin, at: Date.now() } } : {}),
    };
};


/** The fragment as clipboard text. */
export const serializeFragment = (
    fragment: ArrangementFragment,
): string => JSON.stringify(fragment);


/**
 * Clipboard text as a fragment, or `null` — for anything that is not one: other text, a truncated
 * copy, a version this build does not know, a shape that does not hold planes.
 */
export const parseFragment = (
    text: string | null | undefined,
): ArrangementFragment | null => {
    if (!text || text.indexOf(FRAGMENT_MARKER) === -1) {
        return null;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(text);
    } catch {
        return null;
    }

    const fragment = parsed as ArrangementFragment;
    if (!fragment
        || typeof fragment !== 'object'
        || fragment.plurid !== FRAGMENT_MARKER
        || fragment.version !== FRAGMENT_VERSION
        || !Array.isArray(fragment.planes)
        || fragment.planes.length === 0
        || !fragment.planes.every((plane) => plane && typeof plane.path === 'string' && typeof plane.id === 'string')
    ) {
        return null;
    }

    return {
        ...fragment,
        links: Array.isArray(fragment.links) ? fragment.links : [],
    };
};


export interface MaterializeFragmentOptions {
    /**
     * Make a plane of THIS space for a path, exactly as opening it would — the application's own
     * `resolveViewItem` against its registrar (`PluridThunkExtra.resolvePlane`). `undefined` for a
     * path this space does not register, which is what drops it.
     */
    resolve: (path: string) => TreePlane | undefined;
    /** The plane ids already in the target space — the new ones are made not to collide. */
    taken?: Iterable<string>;
    /** Where the pasted roots land, relative to where they were copied from. */
    offset?: { x: number; y: number };
}

export interface MaterializedFragment {
    /** The roots to append to the tree, each a plane of this space. */
    planes: TreePlane[];
    /** The links among them, on the new ids. */
    links: PlaneLink[];
    /** The paths this space does not register, each named once. */
    dropped: string[];
}


/**
 * The fragment as planes THIS space can hold: every path resolved here (so the route, the id shape,
 * the declared size and the query are the target's own), the geometry carried over, the roots offset
 * and pinned — a paste is a placement, not a layout — and unresolvable paths dropped.
 */
export const materializeFragment = (
    fragment: ArrangementFragment,
    options: MaterializeFragmentOptions,
): MaterializedFragment => {
    const {
        resolve,
        offset = { x: 0, y: 0 },
    } = options;

    const taken = new Set(options.taken ?? []);
    const dropped: string[] = [];
    /** the fragment's own id → the plane id it became here. */
    const remap = new Map<string, string>();

    const unique = (
        base: string,
    ): string => {
        let planeID = base;
        let counter = 2;
        while (taken.has(planeID)) {
            planeID = base + '-' + counter;
            counter += 1;
        }
        taken.add(planeID);
        return planeID;
    };

    const carry = (
        node: FragmentPlane,
        parentPlaneID: string | undefined,
    ): TreePlane | undefined => {
        const base = resolve(node.path);
        if (!base) {
            if (!dropped.includes(node.path)) {
                dropped.push(node.path);
            }
            return undefined;
        }

        const planeID = unique(base.planeID);
        remap.set(node.id, planeID);

        const children = (node.children ?? [])
            .map((child) => carry(child, planeID))
            .filter((child): child is TreePlane => !!child);

        // a size the TARGET declares is the target's to keep; otherwise the copied one is the best
        // starting point until this plane measures itself here
        const declared = base.sizeMode === 'declared';
        const bridge = node.bridge ?? {};

        return {
            ...base,
            planeID,
            ...(parentPlaneID ? { parentPlaneID } : {}),
            ...(declared ? {} : {
                width: node.width,
                height: node.height,
                ...(node.sizeMode ? { sizeMode: node.sizeMode } : {}),
            }),
            location: parentPlaneID
                ? { ...node.location }
                : {
                    ...node.location,
                    translateX: node.location.translateX + offset.x,
                    translateY: node.location.translateY + offset.y,
                },
            ...(parentPlaneID
                ? (node.manuallyPositioned ? { manuallyPositioned: true } : {})
                : { manuallyPositioned: true }),
            ...(bridge.length !== undefined ? { bridgeLength: bridge.length } : {}),
            ...(bridge.side !== undefined ? { bridgeSide: bridge.side } : {}),
            ...(bridge.offset !== undefined ? { bridgeOffset: bridge.offset } : {}),
            ...(bridge.angle !== undefined ? { planeAngle: bridge.angle } : {}),
            ...(bridge.coordinates !== undefined ? { linkCoordinates: bridge.coordinates } : {}),
            ...(node.linkSuffix && parentPlaneID ? { spawnedByLinkID: parentPlaneID + node.linkSuffix } : {}),
            children,
            show: true,
        };
    };

    const planes = fragment.planes
        .map((plane) => carry(plane, undefined))
        .filter((plane): plane is TreePlane => !!plane);

    const links: PlaneLink[] = [];
    for (const link of fragment.links) {
        const sourcePlaneID = remap.get(link.sourceID);
        const targetPlaneID = remap.get(link.targetID);
        if (!sourcePlaneID || !targetPlaneID) {
            continue;
        }
        links.push({
            id: sourcePlaneID + '->' + targetPlaneID + (link.kind ? '#' + link.kind : ''),
            sourcePlaneID,
            targetPlaneID,
            ...(link.kind ? { kind: link.kind } : {}),
            ...(link.sourceAnchor ? { sourceAnchor: link.sourceAnchor } : {}),
            ...(link.targetAnchor ? { targetAnchor: link.targetAnchor } : {}),
        });
    }

    return {
        planes,
        links: spaceEngine.tree.fields.pruneLinks(links, spaceEngine.tree.fields.collectPlaneIDs(planes)),
        dropped,
    };
};
// #endregion module
