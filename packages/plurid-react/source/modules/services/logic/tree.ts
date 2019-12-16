import {
    PluridInternalContextPage,
    PluridInternalStatePage,
    TreePage,
} from '@plurid/plurid-data';

import {
    uuidv4 as uuid,
} from '@plurid/plurid-functions';



export const createTreePage = (
    contextPage: PluridInternalContextPage,
    documentPage: PluridInternalStatePage,
) => {
    const treePage: TreePage = {
        pageID: contextPage.id,
        planeID: uuid(),
        path: contextPage.path,
        height: 0,
        width: 0,
        location: {
            translateX: 0,
            translateY: 0,
            translateZ: 0,
            rotateX: 0,
            rotateY: 0,
        },
        show: documentPage.root,
    };
    return treePage;
}


export const updateTreePage = (
    tree: TreePage[],
    page: TreePage,
): TreePage[] => {
    const updatedTree = tree.map(treePage => {
        if (treePage.planeID === page.planeID) {
            return {
                ...page,
            };
        }

        if (treePage.children) {
            return {
                ...treePage,
                children: updateTreePage(treePage.children, page),
            };
        }

        return treePage;
    });

    return updatedTree;
}
