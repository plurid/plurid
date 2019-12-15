import {
    TreePage,
} from '@plurid/plurid-data';

import {
    mathematics,
} from '@plurid/plurid-functions';

import {
    splitIntoGroups,
} from '../utilities';



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
    roots: TreePage[],
    angle: number = 45,
    gap: number = 0,
    middle: number = 0,
): TreePage[] => {
    const tree: TreePage[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;
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

            const treePage: TreePage = {
                ...page,
                location: {
                    translateX,
                    translateY,
                    translateZ,
                    rotateX: 0,
                    rotateY,
                },
            };
            tree.push(treePage);
        }
    }

    return tree;
}


export default computeFaceToFaceLayout;
