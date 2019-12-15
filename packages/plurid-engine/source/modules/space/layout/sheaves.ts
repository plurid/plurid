import {
    TreePage,
} from '@plurid/plurid-data';



const computeSheavesLayout = (
    roots: TreePage[],
    depth: number = 0.3,
    offsetX: number = 0,
    offsetY: number = 0,
): TreePage[] => {
    const tree: TreePage[] = [];

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (const [index, page] of roots.entries()) {
        const translateX = 0;
        const translateY = 0;

        const treePage: TreePage = {
            ...page,
            location: {
                translateX,
                translateY,
                translateZ: 0,
                rotateX: 0,
                rotateY: 0,
            },
        };

        tree.push(treePage);
    }

    return tree;
}


export default computeSheavesLayout;
