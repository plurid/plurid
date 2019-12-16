import {
    TreePage,
} from '@plurid/plurid-data';



export const getTreePageByPlaneID = (
    tree: TreePage[],
    planeID: string
): TreePage | null => {
    let _page = null;

    for (let page of tree) {
        if (page.planeID === planeID) {
            _page = page;
        }

        if (page.children && !_page) {
            _page = getTreePageByPlaneID(page.children, planeID);
        }

        if (_page) {
            break;
        }
    }

    return _page;
}
