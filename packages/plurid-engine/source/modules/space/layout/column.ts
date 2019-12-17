import {
    PluridConfiguration,
    TreePage,

    ROOTS_GAP,
    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    recomputeChildrenLocation,
} from '../location';



const computeColumnLayout = (
    roots: TreePage[],
    columns: number = 2,
    gap: number = ROOTS_GAP,
    configuration: PluridConfiguration = defaultConfiguration,
): TreePage[] => {
    const tree: TreePage[] = [];
    const width = Number.isInteger(configuration.elements.plane.width)
        ? configuration.elements.plane.width
        : configuration.elements.plane.width * window.innerWidth;
    const height = window.innerHeight;
    const gapValue = Number.isInteger(gap)
        ? gap
        : gap * width;

    for (const [index, root] of roots.entries()) {
        const rowIndex = Math.floor(index / columns);
        const columnIndex = index % columns;
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
        }

        tree.push(treePageWithChildren);
    }

    return tree;
}


export default computeColumnLayout;
