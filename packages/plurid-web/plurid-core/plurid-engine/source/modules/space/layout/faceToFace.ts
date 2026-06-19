// #region imports
    // #region libraries
    import {
        TreePlane,
        PluridConfiguration,

        defaultConfiguration,
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
        recomputeChildrenLocation,
    } from '../location';
    // #endregion external
// #endregion imports



// #region module
const toRadians = mathematics.geometry.toRadians;


const computeFaceToFaceTranslateZ = (
    width: number,
    angle: number,
    first: boolean,
) => {
    if (first) {
        return width * Math.sin(toRadians(angle));
    }

    return 0;
}

const computeFaceToFaceTranslateX = (
    width: number,
    angle: number,
    gap: number,
    first: boolean,
    index: number,
) => {
    const firstTranslateX = width * Math.cos(toRadians(angle));
    if (first) {
        return firstTranslateX;
    }

    const value = width * (index - 1)
        + 2 * firstTranslateX
        + gap * index;
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
): TreePlane[] => {
    const windowInnerWidth = typeof window === 'undefined'
        ? 1440
        : window.innerWidth;
    const windowInnerHeight = typeof window === 'undefined'
        ? 840
        : window.innerHeight;

    const tree: TreePlane[] = [];
    const width = mathematics.numbers.checkIntegerNonUnit(configuration.elements.plane.width)
        ? configuration.elements.plane.width
        : configuration.elements.plane.width * windowInnerWidth;
    const height = windowInnerHeight;
    const planeAngle = 90 - angle / 2;
    const columns = 2 + middle;
    const rows = splitIntoGroups(roots, columns);

    // Use the SAME absolute-vs-unit test as column.ts/row.ts (`checkIntegerNonUnit`) instead of
    // `Number.isInteger`, so a fractional gap like `0.04` is treated as a unit of `width`
    // consistently across all layouts.
    const gapValue = mathematics.numbers.checkIntegerNonUnit(gap)
        ? gap
        : gap * width;

    for (const [rowIndex, row] of rows.entries()) {
        // Include the gap in row spacing so gapped rows don't overlap (no-op when gap = 0).
        const translateY = rowIndex * (height + gapValue);

        for (const [index, page] of row.entries()) {
            const first = index === 0;
            // The last plane IN THIS ROW — `columns - 1` is wrong for a final partial row that
            // holds fewer planes than `columns`.
            const last = index === row.length - 1;

            const translateZ = computeFaceToFaceTranslateZ(
                width,
                planeAngle,
                first,
            );
            const translateX = computeFaceToFaceTranslateX(
                width,
                planeAngle,
                gapValue,
                first,
                index
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

            const children = recomputeChildrenLocation(treePage);

            const treePageWithChildren = {
                ...treePage,
                children,
            }

            tree.push(treePageWithChildren);
        }
    }

    return tree;
}
// #endregion module



// #region exports
export default computeFaceToFaceLayout;
// #endregion exports
