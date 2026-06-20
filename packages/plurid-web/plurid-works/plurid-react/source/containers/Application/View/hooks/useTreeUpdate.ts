// #region imports
    // #region libraries
    import {
        useCallback,
    } from 'react';

    import {
        PluridApplicationView,
        PluridConfiguration,
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        space,
        getRegisteredPlanes,
    } from '~services/engine';
    // #endregion external
// #endregion imports



// #region module
export interface UseTreeUpdateParameters {
    view: PluridApplicationView;
    configuration: PluridConfiguration;
    tree: TreePlane[];
    hostname: string;
    planesRegistrar: Parameters<typeof getRegisteredPlanes>[0];
    dispatchSetTree: (tree: TreePlane[]) => void;
}


/**
 * Recompute the space tree (layout) and dispatch it. `treeUpdate` rebuilds the tree from the view +
 * registered planes, then re-attaches the runtime `planeID` + spawned children from the existing
 * tree onto the freshly-laid-out one (keyed by route + a ROUNDED location — the rounding absorbs
 * sub-pixel relayout drift that would otherwise silently close spawned planes). `treeUpdateCallback`
 * is the memoized version for resize listeners; `resolveLayout` is the one-shot initial layout.
 */
export const useTreeUpdate = (
    {
        view,
        configuration,
        tree,
        hostname,
        planesRegistrar,
        dispatchSetTree,
    }: UseTreeUpdateParameters,
) => {
    const treeUpdate = (
        treeView: PluridApplicationView,
        treeConfiguration: PluridConfiguration = configuration,
        layout?: boolean,
    ) => {
        const planes = getRegisteredPlanes(planesRegistrar);

        const spaceTree = new space.tree.Tree(
            {
                planes,
                configuration: treeConfiguration,
                view: treeView,
                layout,
            },
            hostname,
        );

        const computedTree = spaceTree.compute();

        // Re-attach the runtime planeID + spawned children from the existing tree onto the
        // freshly-computed (relaid-out) tree. Keyed by route + a ROUNDED location in an O(n)
        // Map: the old code did an O(roots²) scan with an EXACT `objects.equals(location)`, so
        // a sub-pixel relayout drift (100 vs 100.0001) dropped the match and silently closed
        // spawned planes. Rounding absorbs that drift; roots sit hundreds of px apart, so it
        // can't cause a false match.
        const locationKey = (location: any) =>
            Math.round(location.translateX) + ',' +
            Math.round(location.translateY) + ',' +
            Math.round(location.translateZ) + ',' +
            Math.round(location.rotateX) + ',' +
            Math.round(location.rotateY);
        const stateByKey = new Map<string, typeof tree[number]>();
        for (const statePlane of tree) {
            stateByKey.set(statePlane.route + '@' + locationKey(statePlane.location), statePlane);
        }
        for (const computedPlane of computedTree) {
            const statePlane = stateByKey.get(
                computedPlane.route + '@' + locationKey(computedPlane.location),
            );
            if (statePlane) {
                computedPlane.planeID = statePlane.planeID;
                if (statePlane.children) {
                    computedPlane.children = statePlane.children;
                }
            }
        }

        dispatchSetTree(computedTree);
    }

    const treeUpdateCallback = useCallback(() => {
        treeUpdate(
            view,
            configuration,
            true,
        );
    }, [
        hostname,
        view,
        configuration,
        // Tree REFERENCE, not a per-render `JSON.stringify` of the whole tree — the reducer
        // swaps `state.tree` for a new array on every mutation, so the ref already changes at
        // the same cadence a content hash would, at O(1) instead of O(n).
        tree,
    ]);

    const resolveLayout = () => {
        treeUpdate(
            view,
            configuration,
            true,
        );
    }

    return {
        treeUpdate,
        treeUpdateCallback,
        resolveLayout,
    };
}
// #endregion module



// #region exports
export default useTreeUpdate;
// #endregion exports
