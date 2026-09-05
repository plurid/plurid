// #region imports
    // #region libraries
    import {
        useCallback,
        useRef,
    } from 'react';

    import {
        PluridApplicationView,
        PluridConfiguration,
        TreePlane,
        ViewSize,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        space,
        getRegisteredPlanes,
    } from '~services/engine';

    import {
        resolvePlaneFallbackSize,
    } from '~services/logic/camera';
    // #endregion external
// #endregion imports



// #region module
export interface UseTreeUpdateParameters {
    view: PluridApplicationView;
    configuration: PluridConfiguration;
    tree: TreePlane[];
    /** The measured view the layouts space planes by. */
    viewSize: ViewSize;
    // The View prop is optional; the `space.tree.Tree` constructor's `origin` param is
    // defaulted (`= 'origin'`), so `undefined` is accepted at runtime — match that here.
    hostname: string | undefined;
    planesRegistrar: Parameters<typeof getRegisteredPlanes>[0];
    dispatchSetTree: (tree: TreePlane[]) => void;
    /** Arm an animated relayout (`space.layoutTransition`) before a transitioned tree write. */
    dispatchSetLayoutTransition?: (milliseconds: number) => void;
    /** ms for animated relayouts; 0 (reduced motion) makes them instant. */
    layoutTransitionDuration?: number;
}


export interface TreeUpdateOptions {
    /** Glide the planes to their new placements (a layout switch, a view add/remove). */
    transition?: boolean;
}


/**
 * Recompute the space tree (layout) and dispatch it. `treeUpdate` rebuilds the roots from the view +
 * registered planes, then carries the RUNTIME state of each root across from the existing tree —
 * its `planeID`, spawned children, visibility, measured size, manual pin — keyed by IDENTITY
 * (`sourceID` + route, in order for duplicates), never by location (a relayout exists to move
 * things), and re-places every spawned subtree from its root's new location. `treeUpdateCallback`
 * is the memoized version for resize listeners; `resolveLayout` is the one-shot initial layout.
 */
export const useTreeUpdate = (
    {
        view,
        configuration,
        tree,
        viewSize,
        hostname,
        planesRegistrar,
        dispatchSetTree,
        dispatchSetLayoutTransition,
        layoutTransitionDuration = 0,
    }: UseTreeUpdateParameters,
) => {
    /** The view size of the last layout: a change re-derives the sizes of hidden (unmounted) planes. */
    const layoutViewSize = useRef<ViewSize | undefined>(undefined);

    const treeUpdate = (
        treeView: PluridApplicationView,
        treeConfiguration: PluridConfiguration = configuration,
        layout?: boolean,
        options: TreeUpdateOptions = {},
    ) => {
        const previousViewSize = layoutViewSize.current;
        const viewResized = !!layout
            && !!previousViewSize
            && (previousViewSize.width !== viewSize.width || previousViewSize.height !== viewSize.height);
        if (layout) {
            layoutViewSize.current = viewSize;
        }
        const hiddenFallback = viewResized
            ? resolvePlaneFallbackSize(treeConfiguration, viewSize)
            : undefined;

        const planes = getRegisteredPlanes(planesRegistrar);

        const spaceTree = new space.tree.Tree(
            {
                planes,
                configuration: treeConfiguration,
                view: treeView,
                layout,
                viewSize,
            },
            hostname,
        );

        const computedTree = spaceTree.compute();

        const previousByKey = new Map<string, TreePlane[]>();
        for (const root of tree) {
            const key = root.sourceID + '@' + root.route;
            const list = previousByKey.get(key) || [];
            list.push(root);
            previousByKey.set(key, list);
        }

        const nextTree = computedTree.map((computed) => {
            const candidates = previousByKey.get(computed.sourceID + '@' + computed.route);
            const previous = candidates && candidates.length > 0
                ? candidates.shift()
                : undefined;
            if (!previous) {
                return computed;
            }

            const merged: TreePlane = {
                ...computed,
                planeID: previous.planeID,
                show: previous.show,
                // A hand-set size wins over everything; otherwise the recompute's declared size
                // (a live change of a declaration flows) and the measurement fills the rest.
                width: previous.sizeMode === 'manual' ? previous.width : (computed.width || previous.width),
                height: previous.sizeMode === 'manual' ? previous.height : (computed.height || previous.height),
                ...(previous.sizeMode === 'manual'
                    ? { sizeMode: 'manual' as const }
                    : (computed.sizeMode
                        ? { sizeMode: computed.sizeMode }
                        : (previous.sizeMode ? { sizeMode: previous.sizeMode } : {}))),
                ...(previous.manuallyPositioned
                    ? { manuallyPositioned: true, location: previous.location }
                    : {}),
                ...(previous.children
                    ? {
                        children: hiddenFallback
                            ? space.tree.fields.refreshHiddenPlaneSizes(previous.children, hiddenFallback)
                            : previous.children,
                    }
                    : {}),
            };

            return space.location.recomputeSubtree(merged);
        });

        // An animated relayout: arm the transition window BEFORE the tree write so the planes'
        // first paint at the new placements is the transition's start, never a jump. Only for a
        // live space (a first layout has nothing to glide from).
        if (
            options.transition
            && layout
            && layoutTransitionDuration > 0
            && tree.length > 0
            && dispatchSetLayoutTransition
        ) {
            dispatchSetLayoutTransition(layoutTransitionDuration);
        }

        dispatchSetTree(nextTree);
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
        viewSize,
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
