// #region imports
    // #region libraries
    import {
        TreePlane,
        PluridConfiguration,

        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        recomputeChildrenLocation,
    } from '../location';
    // #endregion external


    // #region internal
    import computeColumnLayout from './column';
    // #endregion internal
// #endregion imports



// #region module
const computeZigZagLayout = (
    pages: TreePlane[],
    angle: number = 45,
    configuration: PluridConfiguration = defaultConfiguration,
): TreePlane[] => {
    const windowInnerWidth = typeof window === 'undefined'
        ? 1440
        : window.innerWidth;
    const windowInnerHeight = typeof window === 'undefined'
        ? 840
        : window.innerHeight;

    const tree: TreePlane[] = [];

    const singleColumnedRoots = computeColumnLayout(pages, 1);

    for (const [index, page] of singleColumnedRoots.entries()) {
        const value = index % 2 === 0
            ? 1
            : -1;
        page.location.rotateY = value * angle;

        const children = recomputeChildrenLocation(page);

        const treePageWithChildren = {
            ...page,
            children,
        }

        tree.push(
            {...treePageWithChildren}
        );
    }

    return tree;
}
// #endregion module



// #region external
export default computeZigZagLayout;
// #endregion external
