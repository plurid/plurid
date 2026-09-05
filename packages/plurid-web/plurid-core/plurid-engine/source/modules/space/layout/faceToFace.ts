// #region imports
    // #region libraries
    import {
        TreePlane,
        PluridConfiguration,

        defaultConfiguration,
        ViewSize,
    } from '@plurid/plurid-data';

    import {
        mathematics,
    } from '@plurid/plurid-functions';
    // #endregion libraries


    // #region external
    import {
        splitIntoGroups,
    } from '../utilities';

    import {
        recomputeSubtree,
    } from '../location';
    // #endregion external
// #endregion imports



// #region module
const toRadians = mathematics.geometry.toRadians;


/** The first plane of a row is tilted toward the others: its own width sets how far it stands out. */
const computeFaceToFaceTranslateZ = (
    firstWidth: number,
    angle: number,
    first: boolean,
) => {
    if (first) {
        return firstWidth * Math.sin(toRadians(angle));
    }
    return 0;
}

/**
 * Along the row, every plane sits after the ones before it — each by ITS OWN width (a declared
 * or measured one; the configured width otherwise) — after the tilted first plane's footprint.
 */
const computeFaceToFaceTranslateX = (
    widths: number[],
    angle: number,
    gap: number,
    index: number,
) => {
    const firstTranslateX = (widths[0] ?? 0) * Math.cos(toRadians(angle));
    if (index === 0) {
        return firstTranslateX;
    }
    let value = 2 * firstTranslateX + gap * index;
    for (let k = 1; k < index; k += 1) {
        value += widths[k] ?? 0;
    }
    return value;
}

const computeFaceToFaceRotateY = (
    angle: number,
    first: boolean,
    last: boolean,
) => {
    const rotateY = first
        ? angle
        : last
            ? -angle
            : 0;

    return rotateY;
}


const computeFaceToFaceLayout = (
    roots: TreePlane[],
    angle: number = 45,
    gap: number = 0,
    middle: number = 0,
    configuration: PluridConfiguration = defaultConfiguration,
    viewSize?: ViewSize,
): TreePlane[] => {
    const windowInnerWidth = viewSize?.width
        ?? (typeof window === 'undefined' ? 1440 : window.innerWidth);
    const windowInnerHeight = viewSize?.height
        ?? (typeof window === 'undefined' ? 840 : window.innerHeight);

    const tree: TreePlane[] = [];
    const width = mathematics.numbers.checkIntegerNonUnit(configuration.elements.plane.width)
        ? configuration.elements.plane.width
        : configuration.elements.plane.width * windowInnerWidth;
    // An unmeasured plane counts as the tallest measured one, else the view height (see column.ts).
    const fallbackHeight = Math.max(0, ...roots.map((root) => root.height || 0)) || windowInnerHeight;
    const planeAngle = 90 - angle / 2;
    const columns = 2 + middle;
    const rows = splitIntoGroups(roots, columns);

    // Use the SAME absolute-vs-unit test as column.ts/row.ts (`checkIntegerNonUnit`) instead of
    // `Number.isInteger`, so a fractional gap like `0.04` is treated as a unit of `width`
    // consistently across all layouts.
    const gapValue = mathematics.numbers.checkIntegerNonUnit(gap)
        ? gap
        : gap * width;

    // Rows stack by their own tallest plane, plus the gap so gapped rows never overlap.
    const rowHeights = rows.map((row) => Math.max(0, ...row.map((page) => page.height || fallbackHeight)));
    let translateY = 0;
    for (const [rowIndex, row] of rows.entries()) {
        if (rowIndex > 0) {
            translateY += rowHeights[rowIndex - 1] + gapValue;
        }
        const widths = row.map((page) => page.width || width);

        for (const [index, page] of row.entries()) {
            const first = index === 0;
            // The last plane IN THIS ROW — `columns - 1` is wrong for a final partial row that
            // holds fewer planes than `columns`.
            const last = index === row.length - 1;

            const translateZ = computeFaceToFaceTranslateZ(
                widths[0],
                planeAngle,
                first,
            );
            const translateX = computeFaceToFaceTranslateX(
                widths,
                planeAngle,
                gapValue,
                index,
            );
            const rotateY = computeFaceToFaceRotateY(
                planeAngle,
                first,
                last,
            );

            const treePage: TreePlane = {
                ...page,
                location: {
                    translateX,
                    translateY,
                    translateZ,
                    rotateX: 0,
                    rotateY,
                },
            };

            tree.push(recomputeSubtree(treePage));
        }
    }

    return tree;
}
// #endregion module



// #region exports
export default computeFaceToFaceLayout;
// #endregion exports
