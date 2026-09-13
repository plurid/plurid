// #region imports
    // #region libraries
    import {
        /** constants */
        PLANE_DEFAULT_ANGLE,

        /** enumerations */
        LAYOUT_TYPES,

        /** interfaces */
        PluridView,
        PluridApplicationView,
        PluridConfiguration,
        RegisteredPluridPlane,
        TreePlane,
        TreePlaneLocation,
        LinkCoordinates,
        PluridPlane,
        ViewSize,
    } from '@plurid/plurid-data';

    import {
        uuid,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        configuredPlaneSize,
    } from '../layout/size';
    import {
        computeColumnLayout,
        computeRowLayout,
        computeFaceToFaceLayout,
        computeSheavesLayout,
        computeZigZagLayout,
    } from '../layout';

    import {
        childLocation,
        resolvePlaneAngle,
        resolveBridgeOffset,
        resolveBridgeSide,
        recomputeSubtree,
        planeDepth,
        DEFAULT_BRIDGE_LENGTH,
        DEFAULT_PLANE_ANGLE,
    } from '../location/child';

    import {
        getTreePlaneByPlaneID,
    } from '../utilities';

    import {
        isHandSized,
        pairRootsByIdentity,
    } from './fields';

    import {
        IsoMatcher,
    } from '~modules/routing';

    import {
        computePlaneAddress,
    } from '~modules/routing/logic';
    // #endregion external
// #endregion imports



// #region module
/**
 * Given a view resolve it to an absolute view
 * and compute a TreePlane if there is a RegisteredPluridPlane
 * for that absolute view.
 *
 * @param view
 */
export const resolveViewItem = <C>(
    planes: Map<string, RegisteredPluridPlane<C>>,
    view: string | PluridView,
    configuration: PluridConfiguration,
    origin = 'origin',
    getCount?: () => number | string,
): TreePlane | undefined => {
    // console.log('resolveViewItem', planes);

    const {
        protocol,
        host,
    } = configuration.network;

    const viewData = typeof view === 'string'
        ? view
        : view.plane;
    // console.log('viewData', viewData);

    const viewAddress = computePlaneAddress(
        viewData,
        undefined,
        origin,
    );
    // console.log('viewAddress', viewAddress);

    // const resolvedView = resolveRoute(
    //     viewData,
    //     protocol,
    //     host,
    // );
    // console.log('resolvedView', resolvedView);

    const iPlanes = planes.values();
    const pluridPlanes: PluridPlane<C>[] = [];
    // The registered entry by absolute route, to carry its declared size onto the tree node.
    const registeredByRoute = new Map<string, RegisteredPluridPlane<C>>();
    for (const iPlane of iPlanes) {
        const plane: PluridPlane<C> = {
            route: iPlane.route.absolute,
            component: iPlane.component,
        };
        pluridPlanes.push(plane);
        registeredByRoute.set(iPlane.route.absolute, iPlane);
    }

    const isoMatcher = new IsoMatcher(
        {
            planes: pluridPlanes,
        },
        origin,
    );

    // const match = isoMatcher.match(resolvedView.route);
    const match = isoMatcher.match(viewData);
    const registered = match && match.kind === 'Plane'
        ? registeredByRoute.get(match.data.route)
        : undefined;
    const declaredWidth = registered?.width && registered.width > 0 ? registered.width : 0;
    const declaredHeight = registered?.height && registered.height > 0 ? registered.height : 0;
    // console.log('isoMatcher match', match);

    if (match) {
        const route = match.match.value;

        const count = getCount ? getCount() : uuid.generate();
        const planeID = route + '@' + count;

        const treePlane: TreePlane = {
            sourceID: route,

            planeID,

            // route: resolvedView.route,
            route: viewAddress,

            routeDivisions: {
                protocol: {
                    value: '',
                    secure: false,
                },
                host: {
                    value: host,
                    controlled: true,
                },
                path: {
                    parameters: {},
                    query: {},
                    value: '',
                },
                space: {
                    parameters: {},
                    query: {},
                    value: '',
                },
                universe: {
                    parameters: {},
                    query: {},
                    value: '',
                },
                cluster: {
                    parameters: {},
                    query: {},
                    value: '',
                },
                // THE QUERY TRAVELS: what the requested route carried beyond its pathname — the
                // matcher read it off the raw route; the plane's component reads it from here
                plane: {
                    value: match.match.value,
                    parameters: match.match.parameters ?? {},
                    fragments: match.match.fragments ?? { elements: [], texts: [] },
                    query: match.match.query ?? {},
                },
                valid: true,
            },

            // A declared size is the node's size from the start (`sizeMode: 'declared'`); an
            // undeclared dimension stays 0 until the plane is measured.
            height: declaredHeight,
            width: declaredWidth,
            ...(declaredWidth || declaredHeight ? { sizeMode: 'declared' as const } : {}),
            location: {
                translateX: 0,
                translateY: 0,
                translateZ: 0,
                rotateX: 0,
                rotateY: 0,
            },
            show: true,
        };

        return treePlane;
    }

    return;
}


/**
 * THE SIZING CONTRACT: the layouts place the roots by their CURRENT sizes — a fresh root carries
 * only a declared dimension, so the previous tree's sizes are copied onto the matching roots
 * (`pairRootsByIdentity`) before placement. A hand-set size is the plane's own and wins over
 * everything; a declared dimension is never overridden by a measurement; a measured dimension is
 * copied only where the configuration leaves that dimension to the content — where it sets it the
 * measurement is an observation of it, made for the PREVIOUS view (copying a measured width after a
 * resize would pitch the grid by a stale width).
 */
export const applyKnownSizes = (
    roots: TreePlane[],
    previousTree: TreePlane[] | undefined,
    configured: { width: number; height: number } = { width: 0, height: 0 },
): TreePlane[] => {
    if (!previousTree || previousTree.length === 0) {
        return roots;
    }
    const pairing = pairRootsByIdentity(previousTree);
    return roots.map((root) => {
        const previous = pairing.take(root);
        if (!previous) {
            return root;
        }
        const manual = isHandSized(previous);
        const width = manual
            ? previous.width
            : (root.width || (configured.width > 0 ? 0 : previous.width) || 0);
        const height = manual
            ? previous.height
            : (root.height || (configured.height > 0 ? 0 : previous.height) || 0);
        if (width === root.width && height === root.height) {
            return root;
        }
        return {
            ...root,
            width,
            height,
        };
    });
};


export const computeSpaceTree = <C>(
    planes: Map<string, RegisteredPluridPlane<C>>,
    view: PluridApplicationView,
    configuration: PluridConfiguration,
    layout: boolean | undefined,
    origin = 'origin',
    getCount: () => number,
    viewSize?: ViewSize,
    previousTree?: TreePlane[],
): TreePlane[] => {
    // console.log('computeSpaceTree');
    // console.log('planes', planes);
    // console.log('configuration', configuration);
    // console.log('computeSpaceTree view', view);
    // console.log('computeSpaceTree origin', origin);

    const freshPlanes: TreePlane[] = [];

    for (const viewItem of view) {
        const treePlane = resolveViewItem(
            planes,
            viewItem,
            configuration,
            origin,
            getCount,
        );

        if (treePlane) {
            freshPlanes.push(treePlane);
        }
    }

    // the roots are placed by what is known of their sizes (the sizing contract)
    const configuredView = viewSize ?? {
        width: typeof window === 'undefined' ? 1440 : window.innerWidth,
        height: typeof window === 'undefined' ? 840 : window.innerHeight,
    };
    const treePlanes = applyKnownSizes(freshPlanes, previousTree, configuredPlaneSize(configuration, configuredView));

    if (!layout) {
        const layoutlessTreePlanes = treePlanes.map(plane => {
            return {
                ...plane,
                location: {
                    rotateX: 0,
                    rotateY: 0,
                    translateX: 0,
                    translateY: 0,
                    translateZ: 0,
                },
            };
        });

        return layoutlessTreePlanes;
    }

    switch(configuration.space.layout.type) {
        case LAYOUT_TYPES.COLUMNS:
            {
                const {
                    columns,
                    columnLength,
                    gap,
                } = configuration.space.layout;
                const columnLayoutTree = computeColumnLayout(
                    treePlanes,
                    columns,
                    columnLength,
                    gap,
                    configuration,
                    viewSize,
                );
                return columnLayoutTree;
            }
        case LAYOUT_TYPES.ROWS:
            {
                const {
                    rows,
                    rowLength,
                    gap,
                } = configuration.space.layout;
                const rowLayoutTree = computeRowLayout(
                    treePlanes,
                    rows,
                    rowLength,
                    gap,
                    configuration,
                    viewSize,
                );
                return rowLayoutTree;
            }
        case LAYOUT_TYPES.ZIG_ZAG:
            {
                const {
                    angle,
                } = configuration.space.layout;
                const zigzagLayoutTree = computeZigZagLayout(
                    treePlanes,
                    angle,
                    configuration,
                    viewSize,
                );
                return zigzagLayoutTree;
            }
        case LAYOUT_TYPES.FACE_TO_FACE:
            {
                const {
                    angle,
                    gap,
                    middle,
                } = configuration.space.layout;
                const faceToFaceLayoutTree = computeFaceToFaceLayout(
                    treePlanes,
                    angle,
                    gap,
                    middle,
                    configuration,
                    viewSize,
                );
                return faceToFaceLayoutTree;
            }
        case LAYOUT_TYPES.SHEAVES:
            {
                const {
                    depth,
                    offsetX,
                    offsetY,
                } = configuration.space.layout;
                const sheavesLayoutTree = computeSheavesLayout(
                    treePlanes,
                    depth,
                    offsetX,
                    offsetY,
                    configuration,
                    viewSize,
                );
                return sheavesLayoutTree;
            }
        case LAYOUT_TYPES.META:
            {
                return [];
            }
        default:
            return [];
    }
}









export const updateTreePlane = (
    tree: TreePlane[],
    updatedPlane: TreePlane,
): TreePlane[] => {
    // Immutable + structurally-shared: only the nodes ON THE PATH to `updatedPlane` get new
    // object identities; every untouched subtree keeps its original reference (so React.memo /
    // referential selectors can skip the planes that didn't change). Previously this mutated
    // `treePlane.children` in place, corrupting the input tree (Redux stale-render/double-apply).
    let changed = false;

    const mapped = tree.map(treePlane => {
        if (treePlane.planeID === updatedPlane.planeID) {
            changed = true;
            return updatedPlane;
        }

        if (treePlane.children) {
            const newChildren = updateTreePlane(
                treePlane.children,
                updatedPlane,
            );
            if (newChildren !== treePlane.children) {
                changed = true;
                return {
                    ...treePlane,
                    children: newChildren,
                };
            }
        }

        return treePlane;
    });

    // Same reference out when nothing matched — preserves structural sharing up the recursion.
    return changed ? mapped : tree;
}



export interface UpdatedTreeWithNewPlane {
    pluridPlaneID: string;
    updatedTree: TreePlane[];
    updatedTreePlane?: TreePlane;
}

export interface UpdateTreeWithNewPlaneOptions {
    /** The stable id of the spawning link (`<parentPlaneID>#<route>#<ordinal>`); stored on the child. */
    linkID?: string;
    /** The width the child renders with until measured (a mirrored child is placed by its width). */
    fallbackWidth?: number;
}


/** A short FNV-1a hex digest, for deterministic plane ids derived from link ids. */
const digest = (
    value: string,
): string => {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
};


/** `base`, or `base-2`, `base-3`, … — the first id not yet in the tree. */
const uniquePlaneID = (
    tree: TreePlane[],
    base: string,
): string => {
    let counter = 2;
    while (getTreePlaneByPlaneID(tree, `${base}-${counter}`)) {
        counter += 1;
    }
    return `${base}-${counter}`;
};


export const updateTreeWithNewPlane = <C>(
    planeRoute: string,
    parentPlaneID: string,
    linkCoordinates: LinkCoordinates,
    tree: TreePlane[],
    planesRegistry: Map<string, RegisteredPluridPlane<C>>,
    configuration: PluridConfiguration,
    hostname = 'origin',
    options: UpdateTreeWithNewPlaneOptions = {},
): UpdatedTreeWithNewPlane => {
    const parentPlane = getTreePlaneByPlaneID(tree, parentPlaneID);

    if (!parentPlane) {
        return {
            pluridPlaneID: '',
            updatedTree: tree,
        };
    }

    // The spawned plane's id is `<route>@<suffix>`: a digest of the link id when the link has one
    // (stable across undo/redo and re-spawns, so a link always owns the same plane id), else a
    // random id — and always unique within the tree (a second instance gets `-2`, `-3`, …).
    const suffix = options.linkID
        ? digest(options.linkID)
        : (uuid.generate() || digest(String(Math.random()) + String(Date.now())));
    const resolvedPlane = resolveViewItem(
        planesRegistry,
        planeRoute,
        configuration,
        hostname,
        () => suffix,
    );

    if (!resolvedPlane) {
        return {
            pluridPlaneID: '',
            updatedTree: tree,
        };
    }

    const treePlane = getTreePlaneByPlaneID(tree, resolvedPlane.planeID)
        ? {
            ...resolvedPlane,
            planeID: uniquePlaneID(tree, resolvedPlane.planeID),
        }
        : resolvedPlane;

    // ONE geometry: the bridge vector AND the child's facing come from the same signed angle,
    // fanned by generation so nested spawns never turn back-to-front.
    const bridgeLength = configuration.space.bridge?.length ?? DEFAULT_BRIDGE_LENGTH;
    const depth = planeDepth(tree, parentPlaneID) + 1;
    const direction = configuration.space.bridge?.direction ?? 'backward';
    const planeAngle = resolvePlaneAngle(
        depth,
        configuration.space.bridge?.planeAngle ?? DEFAULT_PLANE_ANGLE,
        configuration.space.bridge?.fan ?? 'fixed',
        direction,
    );
    const bridgeSide = configuration.space.bridge?.keepBehind
        ? resolveBridgeSide(planeAngle, direction)
        : 'start';
    const bridgeOffset = resolveBridgeOffset(configuration.space.presentation);

    const updatedTreePlane: TreePlane = {
        ...treePlane,
        parentPlaneID,
        location: childLocation(
            parentPlane.location,
            linkCoordinates,
            bridgeLength,
            planeAngle,
            bridgeSide,
            treePlane.width || options.fallbackWidth,
            bridgeOffset,
        ),
        bridgeLength,
        planeAngle,
        bridgeSide,
        bridgeOffset,
        linkCoordinates,
        ...(options.linkID ? { spawnedByLinkID: options.linkID } : {}),
    };

    // New children array (don't `.push` into the shared `parentPlane.children`, which mutates
    // the input tree).
    const updatedParentPlane: TreePlane = {
        ...parentPlane,
        children: parentPlane.children
            ? [...parentPlane.children, updatedTreePlane]
            : [updatedTreePlane],
    };

    const updatedTree = updateTreePlane(tree, updatedParentPlane);

    return {
        pluridPlaneID: updatedTreePlane.planeID,
        updatedTree,
        updatedTreePlane,
    };
}


const sameCoordinates = (
    a: LinkCoordinates | undefined,
    b: LinkCoordinates,
): boolean => !!a && a.x === b.x && a.y === b.y;


/**
 * A link re-measured where it sits on its parent: store the coordinates and re-place the child
 * (and its subtree) from the LIVE parent. Returns the same tree reference when the coordinates
 * are unchanged — the equality gate that stops a measure → dispatch → re-measure loop.
 */
export const updateLinkCoordinates = (
    tree: TreePlane[],
    planeID: string,
    linkCoordinates: LinkCoordinates,
): TreePlane[] => {
    const plane = getTreePlaneByPlaneID(tree, planeID);
    if (!plane || sameCoordinates(plane.linkCoordinates, linkCoordinates)) {
        return tree;
    }

    const parentPlane = plane.parentPlaneID
        ? getTreePlaneByPlaneID(tree, plane.parentPlaneID)
        : undefined;
    if (!parentPlane) {
        return updateTreePlane(tree, { ...plane, linkCoordinates });
    }

    const relocated = recomputeSubtree({
        ...plane,
        linkCoordinates,
        location: childLocation(
            parentPlane.location,
            linkCoordinates,
            plane.bridgeLength ?? DEFAULT_BRIDGE_LENGTH,
            plane.planeAngle ?? DEFAULT_PLANE_ANGLE,
            plane.bridgeSide ?? 'start',
            plane.width,
            plane.bridgeOffset ?? 0,
        ),
    });

    return updateTreePlane(tree, relocated);
}


/** @deprecated use `updateLinkCoordinates` (reads the parent from the live tree). */
export const updatePlaneLocation = (
    tree: TreePlane[],
    _parentPlaneID: string,
    planeID: string,
    linkCoordinates: LinkCoordinates,
) => updateLinkCoordinates(tree, planeID, linkCoordinates);


// `removePageFromTree` was a byte-for-byte duplicate of `removePlaneFromTree` (below) — same
// immutable, structurally-shared removal, only the local names differed. It had no production
// caller (only its own test), so it was deleted and its test repointed at `removePlaneFromTree`.


export const toggleAllChildren = (
    tree: TreePlane[],
    show: boolean,
): TreePlane[] => {
    // Structurally shared: a node whose `show` (and subtree) already matches keeps its reference,
    // and the array is only replaced when some node changed. Never mutates the input.
    let changed = false;
    const next = tree.map((plane) => {
        const children = plane.children
            ? toggleAllChildren(plane.children, show)
            : plane.children;
        if (plane.show === show && children === plane.children) {
            return plane;
        }
        changed = true;
        return {
            ...plane,
            show,
            children,
        };
    });

    return changed ? next : tree;
}


export interface TogglePlaneFromTree {
    updatedTree: TreePlane[];
    updatedPlane: TreePlane | undefined;
}

export const togglePlaneFromTree = (
    tree: TreePlane[],
    pluridPlaneID: string,
    forceShow?: boolean,
): TogglePlaneFromTree => {
    // Path-copy: only the nodes on the way to the target plane get new references (siblings and
    // unrelated roots keep theirs, so their renders bail out); the tree reference itself is kept
    // when the plane is not found. Hiding a plane hides its whole subtree; showing it shows the
    // subtree again.
    let updatedPlane: TreePlane | undefined;

    const visit = (
        nodes: TreePlane[],
    ): TreePlane[] => {
        let changed = false;
        const next = nodes.map((plane) => {
            if (updatedPlane) {
                return plane;
            }

            if (plane.planeID === pluridPlaneID) {
                const show = forceShow ?? !plane.show;
                const children = plane.children
                    ? toggleAllChildren(plane.children, show)
                    : plane.children;
                if (show === plane.show && children === plane.children) {
                    updatedPlane = plane;
                    return plane;
                }
                updatedPlane = {
                    ...plane,
                    show,
                    children,
                };
                changed = true;
                return updatedPlane;
            }

            if (plane.children) {
                const children = visit(plane.children);
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

        return changed ? next : nodes;
    };

    const updatedTree = visit(tree);

    return {
        updatedTree,
        updatedPlane,
    };
}


export const getTreePlaneByID = (
    stateTree: TreePlane[],
    id: string | undefined,
): TreePlane | undefined => {
    if (!id) {
        return;
    }

    for (const plane of stateTree) {
        if (plane.planeID === id) {
            return plane;
        }

        if (plane.children) {
            const found = getTreePlaneByID(
                plane.children,
                id,
            );

            if (found) {
                return found;
            }
        }
    }

    return;
}


export const removeRootFromTree = (
    tree: TreePlane[],
    pluridPlaneID: string,
) => {
    const updatedTree = tree.filter(plane => plane.planeID !== pluridPlaneID);

    return {
        updatedTree,
    };
}


export const removePlaneFromTree = (
    tree: TreePlane[],
    pluridPlaneID: string,
): TreePlane[] => {
    // Immutable + structurally shared: untouched subtrees keep their reference; only the
    // branch that drops a node (or whose descendant was dropped) gets a new identity. The
    // previous version mutated `plane.children` in place.
    let changed = false;

    const updatedTree: TreePlane[] = [];
    for (const plane of tree) {
        if (plane.planeID === pluridPlaneID) {
            changed = true;
            continue;
        }

        if (plane.children) {
            const children = removePlaneFromTree(
                plane.children,
                pluridPlaneID,
            );
            if (children !== plane.children) {
                changed = true;
                updatedTree.push({ ...plane, children });
                continue;
            }
        }

        updatedTree.push(plane);
    }

    return changed ? updatedTree : tree;
}


// #region structural sharing
/**
 * `width`/`height` carry-forward: the layout recompute (`computeSpaceTree`) emits a root/child
 * plane with `width: 0, height: 0` because it cannot know the eventually-rendered pixel size —
 * that is measured at runtime by the plane's ResizeObserver and written back via a SEPARATE
 * `updateSpaceTreePlane` dispatch. So a `0` (or missing) incoming dimension means "unmeasured,
 * keep what we already have", NOT "the plane shrank to zero". Treating it as a change would both
 * blow away the live measurement on every relayout AND defeat reference reuse below.
 */
const carriedDimension = (
    next: number | undefined,
    previous: number,
): number => (
    (!next && previous) ? previous : (next as number)
);

const sameLocation = (
    a: TreePlaneLocation,
    b: TreePlaneLocation,
): boolean =>
    a.translateX === b.translateX
    && a.translateY === b.translateY
    && a.translateZ === b.translateZ
    && a.rotateX === b.rotateX
    && a.rotateY === b.rotateY;

const sameLinkCoordinates = (
    a: TreePlane['linkCoordinates'],
    b: TreePlane['linkCoordinates'],
): boolean => (a === b) || (!!a && !!b && a.x === b.x && a.y === b.y);

/**
 * Every field the renderer/engine reads off a node EXCEPT `children` (reconciled recursively),
 * `location` (compared by the caller) and `width` / `height` / `manuallyPositioned` (carried
 * forward by the caller). `routeDivisions` derive from `route`, so an equal `route` implies they
 * match; the spawn geometry does NOT — `linkCoordinates` are the link's MEASURED position in the
 * parent, `bridgeSide` / `bridgeOffset` / `spawnedByLinkID` are stored at the spawn — so each is
 * compared, and so is `sizeMode` (a hand resize is a change).
 */
const sameNodeOwnFieldsExceptLocation = (
    a: TreePlane,
    b: TreePlane,
): boolean =>
    a.sourceID === b.sourceID
    && a.planeID === b.planeID
    && a.parentPlaneID === b.parentPlaneID
    && a.route === b.route
    && a.show === b.show
    && a.bridgeLength === b.bridgeLength
    && a.planeAngle === b.planeAngle
    && a.bridgeSide === b.bridgeSide
    && a.bridgeOffset === b.bridgeOffset
    && a.spawnedByLinkID === b.spawnedByLinkID
    && sameLinkCoordinates(a.linkCoordinates, b.linkCoordinates)
    && a.sizeMode === b.sizeMode;

const sameNodeOwnFields = (
    a: TreePlane,
    b: TreePlane,
): boolean =>
    sameNodeOwnFieldsExceptLocation(a, b)
    && sameLocation(a.location, b.location);

// Mutually recursive with `reconcileNode`; declared as hoisted `function`s so order doesn't matter.
function reconcileNodeList(
    previous: TreePlane[] | undefined,
    next: TreePlane[],
): TreePlane[] {
    if (!previous || previous.length === 0) {
        return next;
    }

    const previousByID = new Map<string, TreePlane>();
    for (const node of previous) {
        if (node.planeID) {
            previousByID.set(node.planeID, node);
        }
    }

    let everyReused = previous.length === next.length;
    const reconciled = next.map((nextNode, index) => {
        // Pair by stable runtime identity (planeID). A positional fallback only for an id-less
        // node whose route matches — never for a genuinely new plane, which would otherwise inherit
        // an unrelated node's pinned location / measured size.
        const byID = nextNode.planeID ? previousByID.get(nextNode.planeID) : undefined;
        const positional = previous[index];
        const previousNode = byID
            || ((!nextNode.planeID && positional && positional.route === nextNode.route) ? positional : undefined);
        const result = reconcileNode(previousNode, nextNode);
        if (result !== previous[index]) {
            everyReused = false;
        }
        return result;
    });

    // If every node was reused in the same order/length, keep the previous ARRAY reference too, so
    // a consumer reading the whole list (e.g. `<PluridRoots>`) can also bail.
    return everyReused ? previous : reconciled;
}

function reconcileNode(
    previous: TreePlane | undefined,
    next: TreePlane,
): TreePlane {
    if (!previous || previous === next) {
        return next;
    }

    // Depth-first: reconcile children so a subtree whose descendants are all unchanged collapses
    // to the previous reference here.
    let children = next.children;
    if (next.children && next.children.length > 0) {
        children = reconcileNodeList(previous.children, next.children);
    } else if (
        (!next.children || next.children.length === 0)
        && previous.children
        && previous.children.length === 0
    ) {
        children = previous.children;
    }

    const width = carriedDimension(next.width, previous.width);
    const height = carriedDimension(next.height, previous.height);

    // A manually-pinned plane keeps its user-set location + flag across auto-layout recomputes —
    // the same carry-forward idea as measured `width`/`height`. (The deliberate MOVE mutates the
    // tree directly via `transformSelectedPlanes`, bypassing reconcile, so it is NOT clobbered here.)
    const pinned = previous.manuallyPositioned === true;
    const location = pinned ? previous.location : next.location;
    const manuallyPositioned = pinned ? true : next.manuallyPositioned;

    const ownUnchanged = pinned
        ? sameNodeOwnFieldsExceptLocation(previous, next)
        : sameNodeOwnFields(previous, next);

    const unchanged =
        ownUnchanged
        && children === previous.children
        && width === previous.width
        && height === previous.height
        && manuallyPositioned === previous.manuallyPositioned;

    if (unchanged) {
        return previous;
    }

    // Partially changed: graft the reconciled children + carried dimensions + carried location/flag
    // so deeper unchanged subtrees, live measurement, and manual positioning all survive.
    if (
        children !== next.children
        || width !== next.width
        || height !== next.height
        || location !== next.location
        || manuallyPositioned !== next.manuallyPositioned
    ) {
        return {
            ...next,
            width,
            height,
            children,
            location,
            manuallyPositioned,
        };
    }

    return next;
}

/**
 * Structural-sharing reconciliation: returns `nextTree`, but every node (and array) that is
 * deep-equal to its counterpart in `previousTree` is replaced by the PREVIOUS reference. Producers
 * of a new tree routinely rebuild it from scratch (a layout recompute emits brand-new node objects
 * for every plane even when only one moved); without this, every connected `<PluridRoot>`/`<Plane>`
 * receives fresh-identity props and re-renders. Running this in the `setTree` reducer means EVERY
 * tree-replacing path (link spawn, relayout, resize, persistence restore) gets reference stability
 * for free, so per-plane memoization actually pays off and only the genuinely-changed planes render.
 */
export const reconcileTree = (
    previousTree: TreePlane[] | undefined,
    nextTree: TreePlane[],
): TreePlane[] => {
    if (!previousTree || previousTree === nextTree) {
        return nextTree;
    }
    return reconcileNodeList(previousTree, nextTree);
};
// #endregion structural sharing
// #endregion module
