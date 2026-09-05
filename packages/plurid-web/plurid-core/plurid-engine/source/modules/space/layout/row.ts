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
const computeRowLayout = (
    roots: TreePlane[],
    rows: number = 1,
    rowLength?: number,
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

    // Guard against `rows === 0` (→ `Math.ceil(n/0) === Infinity`, collapsing every plane into
    // one row) and honor `rowLength` only as a positive count (see column.ts).
    const safeRows = rows > 0 ? rows : 1;
    const length = rowLength && rowLength > 0
        ? rowLength
        : Math.ceil(roots.length / safeRows);
    const rowOf = (index: number) => Math.floor(index / length);
    const columnOf = (index: number) => index % length;

    // Per-column widths and per-row heights (see column.ts): mixed sizes pack without overlap,
    // unmeasured planes keep the uniform grid.
    const rowCount = Math.max(1, Math.ceil(roots.length / Math.max(1, length)));
    const fallbackHeight = Math.max(0, ...roots.map((root) => root.height || 0)) || windowInnerHeight;
    const widths = groupSizes(roots, length, columnOf, (root) => root.width, width);
    const heights = groupSizes(roots, rowCount, rowOf, (root) => root.height, fallbackHeight);
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
export default computeRowLayout;
// #endregion exports
