import {
    PluridInternalContextPage,
    PluridInternalStatePage,
    TreePage,
    LinkCoordinates,
} from '@plurid/plurid-data';

import {
    uuid,
} from '@plurid/plurid-functions';



export const createTreePage = (
    contextPage: PluridInternalContextPage,
    documentPage: PluridInternalStatePage,
) => {
    const treePage: TreePage = {
        pageID: contextPage.id,
        planeID: uuid.generate(),
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
        // show: documentPage.root,
        show: true,
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



export const updateTreeByPlaneIDWithLinkCoordinates = (
    tree: TreePage[],
    planeID: string,
    linkCoordinates: LinkCoordinates,
): TreePage[] => {
    const updatedTree = tree.map(treePage => {
        if (treePage.planeID === planeID) {
            const updatedPage = {
                ...treePage,
                linkCoordinates,
            };

            return updatedPage;
        }

        if (treePage.children) {
            const updatedChildren = updateTreeByPlaneIDWithLinkCoordinates(
                treePage.children,
                planeID,
                linkCoordinates,
            );

            const updatedPage = {
                ...treePage,
                children: updatedChildren,
            };

            return updatedPage;
        }

        return treePage;
    });

    return updatedTree;
}
