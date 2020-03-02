import {
    /** interfaces */
    TreePage,
} from '@plurid/plurid-data';



export const computeSpaceSize = (
    tree: TreePage[],
) => {
    let width = 0;
    let height = 0;
    let depth = 0;
    let topCorner = {
        x: 0,
        y: 0,
        z: 0,
    };

    // console.log('tree', tree);
    tree.map(treePage => {
        // console.log('treePage', treePage);

        const spaceWidth = treePage.location.translateX + treePage.width;
        // console.log('spaceWidth', spaceWidth);
        if (spaceWidth > width) {
            width = spaceWidth;
        }

        const spaceHeight = treePage.location.translateY + treePage.height;
        // console.log('spaceHeight', spaceHeight);
        if (spaceHeight > height) {
            height = spaceHeight;
        }

        const spaceDepth = treePage.location.translateZ;
        // console.log('spaceDepth', spaceDepth);
        if (spaceDepth > depth) {
            depth = spaceDepth;
        }
    });

    // console.log('-------------');

    return {
        width,
        height,
        depth,
        topCorner,
    };
}


export const findPage = (
    view: string,
    pages: TreePage[],
) => {
    for (const page of pages) {
        if (page.path === view) {
            return page;
        }
    }
}


export const splitIntoGroups = <T>(
    data: T[],
    length: number,
): T[][] => {
    const initialArray = [...data];
    const groups: any[] = [];

    while (initialArray.length) {
        const group = initialArray.splice(0, length);
        groups.push(group);
    }

    return groups;
}
