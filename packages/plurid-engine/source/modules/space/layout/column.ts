import {
    PluridConfiguration,
    TreePlane,

    ROOTS_GAP,
    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    mathematics,
} from '@plurid/plurid-functions';

import {
    recomputeChildrenLocation,
} from '../location';



const computeColumnLayout = (
    roots: TreePlane[],
    columns: number = 1,
    columnLength?: number,
    gap: number = ROOTS_GAP,
    configuration: PluridConfiguration = defaultConfiguration,
): TreePlane[] => {
    const tree: TreePlane[] = [];
    const configurationWidth = configuration.elements.plane.width;
    const width = mathematics.numbers.checkIntegerNonUnit(configurationWidth)
        ? configurationWidth
        : configurationWidth * window.innerWidth;
    const height = window.innerHeight;
    const gapValue = mathematics.numbers.checkIntegerNonUnit(gap)
        ? gap
        : gap * width;

    const length = columnLength || Math.ceil(roots.length / columns);

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

        const children = recomputeChildrenLocation(treePage);

        const treePageWithChildren = {
            ...treePage,
            children,
        };

        tree.push(treePageWithChildren);
    }

    return tree;
}


export default computeColumnLayout;
