import {
    /** interfaces */
    PluridView,
    TreePage,
    SpaceLocation,
} from '@plurid/plurid-data';

import {
    findPage,
} from '../utilities';



export const computeViewTree = (
    pages: TreePage[],
    view: string[] | PluridView[],
): TreePage[] => {
    const viewTree: TreePage[] = [];

    for (const pageView of view) {
        const page = pages.find(p => p.path === pageView);

        if (page) {
            viewTree.push(page);
        }
    }

    return viewTree;
}


/**
 * Compute only the view within a given radius around the user.
 *
 * @param pages
 * @param view
 * @param location
 */
export const computeCulledView = (
    pages: TreePage[],
    view: string[] | PluridView[],
    location: SpaceLocation,
    radius: number = 8000,
) => {
    const culledView: string[] = [];

    for (const viewPage of view) {
        const path = typeof viewPage === 'string'
            ? viewPage
            : viewPage.path;

        const page = findPage(
            path,
            pages,
        );
        if (!page) {
            return;
        }

        const pageInView = checkPageInView(
            page,
            location,
            radius,
        );

        if (pageInView) {
            culledView.push(
                page.path,
            );
        }
    }

    return culledView;
}


export const checkPageInView = (
    page: TreePage,
    location: SpaceLocation,
    radius: number,
) => {
    const radiusLeft = location.translationX < 0
        ? Math.abs(location.translationX) - radius
        : -1 * location.translationX - radius;
    const radiusRight = location.translationX < 0
        ? Math.abs(location.translationX) + radius
        : -1 * location.translationX + radius;
    const locationX = page.location.translateX;

    const radiusTop = location.translationY < 0
        ? Math.abs(location.translationY) - radius
        : -1 * location.translationY - radius;
    const radiusBottom = location.translationY < 0
        ? Math.abs(location.translationY) + radius
        : -1 * location.translationY + radius;
    const locationY = page.location.translateY;

    const inViewOnX = radiusLeft <= locationX && locationX <= radiusRight;
    const inViewOnY = radiusTop <= locationY && locationY <= radiusBottom;

    if (
        inViewOnX && inViewOnY
    ) {
        return true;
    }

    return false;
}
