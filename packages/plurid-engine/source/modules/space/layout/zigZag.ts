import {
    TreePage,
} from '@plurid/plurid-data';

import computeColumnLayout from './column';

import {
    recomputeChildrenLocation,
} from '../varia';



const computeZigZagLayout = (
    pages: TreePage[],
    angle: number = 45,
): TreePage[] => {
    const tree: TreePage[] = [];

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
