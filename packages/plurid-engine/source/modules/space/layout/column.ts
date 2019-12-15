import {
    TreePage,

    ROOTS_GAP,
} from '@plurid/plurid-data';



const computeColumnLayout = (
    roots: TreePage[],
    columns: number = 2,
    columnsGap: number = ROOTS_GAP,
    rowsGap: number = ROOTS_GAP,
): TreePage[] => {
    const tree: TreePage[] = [];

    const width = window.innerWidth;
    const height = window.innerHeight;

    for (const [index, root] of roots.entries()) {
        const rowIndex = Math.floor(index / columns);
        const columnIndex = index % columns;
        const translateX = columnIndex * (width + columnsGap);
        const translateY = rowIndex * (height + rowsGap);

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

        tree.push(treePage);
    }

    return tree;
}

export default computeColumnLayout;
