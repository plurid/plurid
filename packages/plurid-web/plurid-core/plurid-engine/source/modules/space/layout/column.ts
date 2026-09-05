// #region imports
    // #region libraries
    import {
        PluridConfiguration,
        TreePlane,
        ViewSize,

        ROOTS_GAP,
        defaultConfiguration,
    } from '@plurid/plurid-data';

    import {
        mathematics,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        recomputeSubtree,
    } from '../location';
    import {
        groupSizes,
        prefixOffsets,
    } from './pitch';
    // #endregion external
// #endregion imports



// #region module
const computeColumnLayout = (
    roots: TreePlane[],
    columns: number = 1,
    columnLength?: number,
    gap: number = ROOTS_GAP,
    configuration: PluridConfiguration = defaultConfiguration,
    viewSize?: ViewSize,
): TreePlane[] => {
    const windowInnerWidth = viewSize?.width
        ?? (typeof window === 'undefined' ? 1440 : window.innerWidth);
    const windowInnerHeight = viewSize?.height
        ?? (typeof window === 'undefined' ? 840 : window.innerHeight);

    const tree: TreePlane[] = [];
    const configurationWidth = configuration.elements.plane.width;
    const width = mathematics.numbers.checkIntegerNonUnit(configurationWidth)
        ? configurationWidth
        : configurationWidth * windowInnerWidth;
    const gapValue = mathematics.numbers.checkIntegerNonUnit(gap)
        ? gap
        : gap * width;

    // Guard against `columns === 0` (→ `Math.ceil(n/0) === Infinity`, which collapses every
    // plane into one column) and honor an explicit `columnLength` only when it's a positive
    // count (`|| ` alone would discard a deliberate small value but also a bogus 0/negative).
    const safeColumns = columns > 0 ? columns : 1;
    const length = columnLength && columnLength > 0
        ? columnLength
        : Math.ceil(roots.length / safeColumns);
    const columnOf = (index: number) => Math.floor(index / length);
    const rowOf = (index: number) => index % length;

    // Per-column widths and per-row heights: each column is as wide as its widest plane (a
    // declared or measured width; the configured width for an unmeasured one), each row as tall
    // as its tallest (an unmeasured plane counts as the tallest measured plane, else the view
    // height) — mixed sizes pack without overlap, and unmeasured planes keep the uniform grid.
    const columnCount = Math.max(1, Math.ceil(roots.length / Math.max(1, length)));
    const fallbackHeight = Math.max(0, ...roots.map((root) => root.height || 0)) || windowInnerHeight;
    const widths = groupSizes(roots, columnCount, columnOf, (root) => root.width, width);
    const heights = groupSizes(roots, length, rowOf, (root) => root.height, fallbackHeight);
    const xOffsets = prefixOffsets(widths, gapValue);
    const yOffsets = prefixOffsets(heights, gapValue);

    for (const [index, root] of roots.entries()) {
        const treePage: TreePlane = {
            ...root,
            location: {
                translateX: xOffsets[columnOf(index)] ?? 0,
                translateY: yOffsets[rowOf(index)] ?? 0,
                translateZ: 0,
                rotateX: 0,
                rotateY: 0,
            },
        };
        const treePageWithChildren = recomputeSubtree(treePage);
        tree.push(treePageWithChildren);
    }

    return tree;
}
// #endregion module



// #region exports
export default computeColumnLayout;
// #endregion exports
