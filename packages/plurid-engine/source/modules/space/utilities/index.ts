import {
    /** interfaces */
    TreePlane,
} from '@plurid/plurid-data';



export const computeSpaceSize = (
    tree: TreePlane[],
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
    pages: TreePlane[],
) => {
    for (const page of pages) {
        if (page.route === view) {
            return page;
        }
    }

    return;
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


export const getTreePlaneByPlaneID = (
    tree: TreePlane[],
    planeID: string
): TreePlane | null => {
    let _page = null;

    for (let page of tree) {
        if (page.planeID === planeID) {
            _page = page;
        }

        if (page.children && !_page) {
            _page = getTreePlaneByPlaneID(page.children, planeID);
        }

        if (_page) {
            break;
        }
    }

    return _page;
}
