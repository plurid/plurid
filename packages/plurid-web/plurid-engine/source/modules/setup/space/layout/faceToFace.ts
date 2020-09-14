import {
    TreePlane,
    PluridConfiguration,

    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    mathematics,
} from '@plurid/plurid-functions';

import {
    splitIntoGroups,
} from '../utilities';

import {
    recomputeChildrenLocation,
} from '../location';



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

    const gapValue = Number.isInteger(gap)
        ? gap
        : gap * width;

    for (const [index, row] of rows.entries()) {
        const translateY = index * height;

        for (const [index, page] of row.entries()) {
            const first = index === 0;
            const last = index === columns - 1;

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


export default computeFaceToFaceLayout;
