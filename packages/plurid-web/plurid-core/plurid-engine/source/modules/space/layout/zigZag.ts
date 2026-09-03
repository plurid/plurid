// #region imports
    // #region libraries
    import {
        TreePlane,
        PluridConfiguration,

        defaultConfiguration,
        ViewSize,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        recomputeSubtree,
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
    viewSize?: ViewSize,
): TreePlane[] => {
    const windowInnerWidth = viewSize?.width
        ?? (typeof window === 'undefined' ? 1440 : window.innerWidth);
    const windowInnerHeight = viewSize?.height
        ?? (typeof window === 'undefined' ? 840 : window.innerHeight);

    const tree: TreePlane[] = [];

    const singleColumnedRoots = computeColumnLayout(
        pages,
        1,
        undefined,
        undefined,
        configuration,
        viewSize,
    );

    for (const [index, root] of singleColumnedRoots.entries()) {
        const value = index % 2 === 0
            ? 1
            : -1;

        const page: TreePlane = {
            ...root,
            location: {
                ...root.location,
                rotateY: value * angle,
            },
        };

        tree.push(recomputeSubtree(page));
    }

    void windowInnerWidth;
    void windowInnerHeight;

    return tree;
}
// #endregion module



// #region external
export default computeZigZagLayout;
// #endregion external
