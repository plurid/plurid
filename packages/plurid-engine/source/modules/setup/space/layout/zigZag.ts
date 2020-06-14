import {
    TreePlane,
    PluridConfiguration,

    defaultConfiguration,
} from '@plurid/plurid-data';

import computeColumnLayout from './column';

import {
    recomputeChildrenLocation,
} from '../location';



const computeZigZagLayout = (
    pages: TreePlane[],
    angle: number = 45,
    configuration: PluridConfiguration = defaultConfiguration,
): TreePlane[] => {
    const windowInnerWidth = typeof window === 'undefined'
        ? 1440
        : window.innerWidth;
    const windowInnerHeight = typeof window === 'undefined'
        ? 840
        : window.innerHeight;

    const tree: TreePlane[] = [];

    const singleColumnedRoots = computeColumnLayout(pages, 1);

    for (const [index, page] of singleColumnedRoots.entries()) {
        const value = index % 2 === 0
            ? 1
            : -1;
        page.location.rotateY = value * angle;

        const children = recomputeChildrenLocation(page);

        const treePageWithChildren = {
            ...page,
            children,
        }

        tree.push(
            {...treePageWithChildren}
        );
    }

    return tree;
}


export default computeZigZagLayout;
