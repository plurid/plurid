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
    const height = windowInnerHeight;
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

    for (const [index, root] of roots.entries()) {
        const rowIndex = index % length;
        const columnIndex = Math.floor(index / length);

        const translateX = columnIndex * (width + gapValue);
        const translateY = rowIndex * (height + gapValue);

        const treePage: TreePlane = {
            ...root,
            location: {
                translateX,
                translateY,
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
