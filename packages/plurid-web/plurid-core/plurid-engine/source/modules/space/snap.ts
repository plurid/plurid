// #region imports
    // #region libraries
    import {
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/** An axis-aligned box in space units (a plane's top-left corner and measured size). */
export interface SnapBox {
    id: string;
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export type SnapEdge =
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'centerX'
    | 'centerY';

export interface SnapOptions {
    /** Max distance (space units) for an edge to attract. Default `12`. */
    threshold?: number;
    /** Which edges attract. Default: all six. */
    edges?: SnapEdge[];
    /** When no edge attracts, snap the group's top-left to this grid (space units). */
    grid?: number;
}

export interface SnapGuide {
    axis: 'x' | 'y';
    /** The line's position in space units. */
    position: number;
    /** The edge of the OTHER plane the selection snapped to (or `grid`). */
    edge: SnapEdge | 'grid';
}

export interface SnapResult {
    dx: number;
    dy: number;
    guides: SnapGuide[];
}

export const DEFAULT_SNAP_THRESHOLD = 12;

export const ALL_SNAP_EDGES: SnapEdge[] = [
    'left',
    'right',
    'top',
    'bottom',
    'centerX',
    'centerY',
];


export const boxOfPlane = (
    plane: TreePlane,
    fallback: { width: number; height: number } = { width: 400, height: 300 },
): SnapBox => {
    const width = plane.width || fallback.width;
    const height = plane.height || fallback.height;

    return {
        id: plane.planeID,
        left: plane.location.translateX,
        top: plane.location.translateY,
        right: plane.location.translateX + width,
        bottom: plane.location.translateY + height,
    };
};


/** The selection's and the other shown planes' boxes, from the tree (children included). */
export const collectSnapBoxes = (
    tree: TreePlane[],
    selected: Set<string>,
    fallback?: { width: number; height: number },
): { selection: SnapBox[]; others: SnapBox[] } => {
    const selection: SnapBox[] = [];
    const others: SnapBox[] = [];

    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            if (node.show !== false) {
                (selected.has(node.planeID) ? selection : others).push(boxOfPlane(node, fallback));
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(tree);

    return {
        selection,
        others,
    };
};


const edgeValue = (
    box: SnapBox,
    edge: SnapEdge,
): number => {
    switch (edge) {
        case 'left': return box.left;
        case 'right': return box.right;
        case 'top': return box.top;
        case 'bottom': return box.bottom;
        case 'centerX': return (box.left + box.right) / 2;
        case 'centerY': return (box.top + box.bottom) / 2;
        default: return 0;
    }
};

const X_EDGES: SnapEdge[] = ['left', 'right', 'centerX'];
const Y_EDGES: SnapEdge[] = ['top', 'bottom', 'centerY'];

/** Which edges of another box a selection edge may attract to (a side to either side, a center to a center). */
const attractsTo = (
    edge: SnapEdge,
): SnapEdge[] => {
    switch (edge) {
        case 'left':
        case 'right':
            return ['left', 'right'];
        case 'top':
        case 'bottom':
            return ['top', 'bottom'];
        case 'centerX':
            return ['centerX'];
        case 'centerY':
            return ['centerY'];
        default:
            return [];
    }
};


interface AxisSnap {
    delta: number;
    guide: SnapGuide;
}

/**
 * The nearest attraction on one axis: over every selection box × other box × edge pair, the
 * smallest |distance| within the threshold. STRICTLY closer wins, so ties resolve to the first
 * candidate in (selection, others, edges) order — deterministic, and the same in the guides and the
 * release snap because both call this.
 */
const snapAxis = (
    selection: SnapBox[],
    others: SnapBox[],
    edges: SnapEdge[],
    axis: 'x' | 'y',
    threshold: number,
): AxisSnap | undefined => {
    let best: AxisSnap | undefined;
    let bestAbs = threshold;

    for (const box of selection) {
        for (const edge of edges) {
            const value = edgeValue(box, edge);
            for (const other of others) {
                for (const target of attractsTo(edge)) {
                    const position = edgeValue(other, target);
                    const delta = position - value;
                    const abs = Math.abs(delta);
                    if (abs < bestAbs || (best === undefined && abs <= bestAbs)) {
                        bestAbs = abs;
                        best = {
                            delta,
                            guide: {
                                axis,
                                position,
                                edge: target,
                            },
                        };
                    }
                }
            }
        }
    }

    return best;
};


const gridSnap = (
    value: number,
    grid: number,
    threshold: number,
): number | undefined => {
    const target = Math.round(value / grid) * grid;
    const delta = target - value;
    return Math.abs(delta) <= threshold ? delta : undefined;
};


/**
 * The offset that lines the selection up with the nearest other plane (edge to edge, center to
 * center) on each axis — within `threshold`, else the grid when configured, else 0 — with the
 * guide lines it snapped to. ONE function for the drag preview (`AlignmentGuides`) and the release
 * snap (`snapSelection`), so what is previewed is exactly what lands.
 */
export const computeSnap = (
    selection: SnapBox[],
    others: SnapBox[],
    options: SnapOptions = {},
): SnapResult => {
    const threshold = options.threshold ?? DEFAULT_SNAP_THRESHOLD;
    const edges = options.edges ?? ALL_SNAP_EDGES;
    const result: SnapResult = {
        dx: 0,
        dy: 0,
        guides: [],
    };

    if (selection.length === 0) {
        return result;
    }

    const xEdges = edges.filter((edge) => X_EDGES.includes(edge));
    const yEdges = edges.filter((edge) => Y_EDGES.includes(edge));

    const x = others.length > 0 ? snapAxis(selection, others, xEdges, 'x', threshold) : undefined;
    const y = others.length > 0 ? snapAxis(selection, others, yEdges, 'y', threshold) : undefined;

    if (x) {
        result.dx = x.delta;
        result.guides.push(x.guide);
    } else if (options.grid && options.grid > 0) {
        const delta = gridSnap(selection[0].left, options.grid, threshold);
        if (delta !== undefined) {
            result.dx = delta;
            result.guides.push({ axis: 'x', position: selection[0].left + delta, edge: 'grid' });
        }
    }

    if (y) {
        result.dy = y.delta;
        result.guides.push(y.guide);
    } else if (options.grid && options.grid > 0) {
        const delta = gridSnap(selection[0].top, options.grid, threshold);
        if (delta !== undefined) {
            result.dy = delta;
            result.guides.push({ axis: 'y', position: selection[0].top + delta, edge: 'grid' });
        }
    }

    return result;
};


/** The bounds of a set of boxes. */
export const boxesBounds = (
    boxes: SnapBox[],
): SnapBox | undefined => {
    if (boxes.length === 0) {
        return undefined;
    }
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;
    for (const box of boxes) {
        left = Math.min(left, box.left);
        top = Math.min(top, box.top);
        right = Math.max(right, box.right);
        bottom = Math.max(bottom, box.bottom);
    }
    return {
        id: '',
        left,
        top,
        right,
        bottom,
    };
};
// #endregion module
