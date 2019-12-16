import {
    TreePage,

    ROOTS_GAP,
} from '@plurid/plurid-data';



const computeColumnLayout = (
    roots: TreePage[],
    columns: number = 2,
    gap: number = ROOTS_GAP,
): TreePage[] => {
    const tree: TreePage[] = [];
    const width = window.innerWidth;
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
            // location: {
            //     translateX,
            //     translateY,
            //     translateZ: 0,
            //     rotateX: 0,
            //     rotateY: 0,
            // },
            location: {
                translateX: -1200,
                translateY,
                translateZ: -300,
                rotateX: 0,
                rotateY: 350,
            },
        };

        tree.push(treePage);
    }

    return tree;
}


export default computeColumnLayout;
