import {
    TreePlane,
    PluridConfiguration,

    defaultConfiguration,
} from '@plurid/plurid-data';

import {
    mathematics,
} from '@plurid/plurid-functions';

import {
    recomputeChildrenLocation,
} from '../location';



const computeSheavesLayout = (
    roots: TreePlane[],
    depth: number = 0.3,
    offsetX: number = 0,
    offsetY: number = 0,
    configuration: PluridConfiguration = defaultConfiguration,
): TreePlane[] => {
    const tree: TreePlane[] = [];

    const width = mathematics.numbers.checkIntegerNonUnit(configuration.elements.plane.width)
        ? configuration.elements.plane.width
        : configuration.elements.plane.width * window.innerWidth;
    const height = window.innerHeight;

    for (const [index, page] of roots.entries()) {
        const translateX = 0;
        const translateY = 0;

        const treePage: TreePlane = {
            ...page,
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


export default computeSheavesLayout;
