import {
    TreePage,
} from '@plurid/plurid-data';

import computeColumnLayout from './column';



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

        tree.push({
            ...page,
        });
    }

    return tree;
}


export default computeZigZagLayout;
