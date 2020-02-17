import {
    PluridConfiguration,
    TreePage,

    ROOTS_GAP,
    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    mathematics,
} from '@plurid/plurid-functions';

import {
    recomputeChildrenLocation,
} from '../location';



const computeRowLayout = (
    roots: TreePage[],
    rows: number = 1,
    gap: number = ROOTS_GAP,
    configuration: PluridConfiguration = defaultConfiguration,
): TreePage[] => {
    const tree: TreePage[] = [];
    const configurationWidth = configuration.elements.plane.width;
    const width = mathematics.numbers.checkIntegerNonUnit(configurationWidth)
        ? configurationWidth
        : configurationWidth * window.innerWidth;
    const height = window.innerHeight;
    const gapValue = mathematics.numbers.checkIntegerNonUnit(gap)
        ? gap
        : gap * width;

    for (const [index, root] of roots.entries()) {
        const rowIndex = index % rows;
        const columnIndex = Math.floor(index / rows);
        const translateX = columnIndex * (width + gapValue);
        const translateY = rowIndex * (height + gapValue);

        const treePage: TreePage = {
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


export default computeRowLayout;
