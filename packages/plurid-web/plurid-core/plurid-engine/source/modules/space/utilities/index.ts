// #region imports
    // #region libraries
    import {
        /** interfaces */
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export const computeSpaceSize = (
    tree: TreePlane[],
) => {
    let width = 0;
    let height = 0;
    let depth = 0;
    const topCorner = {
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


/**
 * `data` in consecutive groups of `length`. Any length is safe: it is a whole number of at least 1
 * (`splice(0, 0 | −1 | NaN | 0.5)` took nothing, and the loop that relied on it never ended), and
 * a length past the data is one group.
 */
export const splitIntoGroups = <T>(
    data: T[],
    length: number,
): T[][] => {
    const size = length >= 1 ? Math.floor(length) : 1;
    const groups: T[][] = [];

    for (let start = 0; start < data.length; start += size) {
        groups.push(data.slice(start, start + size));
    }

    return groups;
}


export const getTreePlaneByPlaneID = (
    tree: TreePlane[],
    planeID: string
): TreePlane | null => {
    let _page = null;

    for (const page of tree) {
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
// #endregion module
