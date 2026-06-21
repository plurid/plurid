// #region imports
    // #region libraries
    import {
        createSelector,
    } from '@reduxjs/toolkit';

    import {
        TreePlane,
        PlaneLink,
        SpaceTransform,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        AppState,
    } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
export const getSpace = (state: AppState) => state.space;
export const getLoading = (state: AppState): boolean => state.space.loading;
export const getResolvedLayout = (state: AppState): boolean => state.space.resolvedLayout;
export const getTransformMatrix = (state: AppState) => state.space.transform;
export const getAnimatedTransform = (state: AppState): boolean => state.space.animatedTransform;
export const getTransformTime = (state: AppState): number => state.space.transformTime;

export const getRotationX = (state: AppState): number => state.space.rotationX;
export const getRotationY = (state: AppState): number => state.space.rotationY;
export const getTranslationX = (state: AppState): number => state.space.translationX;
export const getTranslationY = (state: AppState): number => state.space.translationY;
export const getTranslationZ = (state: AppState): number => state.space.translationZ;
export const getScale = (state: AppState): number => state.space.scale;
export const getTree = (state: AppState): TreePlane[] => state.space.tree;
// Memoized: returns a stable object reference unless one of the six transform scalars
// changes, so consumers (Viewcube, View) don't re-render on unrelated state updates.
export const getTransform = createSelector(
    [
        getRotationX,
        getRotationY,
        getTranslationX,
        getTranslationY,
        getTranslationZ,
        getScale,
    ],
    (
        rotationX,
        rotationY,
        translationX,
        translationY,
        translationZ,
        scale,
    ) => ({
        rotationX,
        rotationY,
        translationX,
        translationY,
        translationZ,
        scale,
    } as SpaceTransform),
)
export const getActiveUniverseID = (state: AppState) => state.space.activeUniverseID;

export const getView = (state: AppState) => state.space.view;
export const getViewSize = (state: AppState) => state.space.viewSize;
export const getCulledView = (state: AppState) => state.space.culledView;

export const getActivePlaneID = (state: AppState) => state.space.activePlaneID;
export const getIsolatePlane = (state: AppState) => state.space.isolatePlane;
export const getLastClosedPlane = (state: AppState) => state.space.lastClosedPlane;


// Normalized `planeID -> node` index, rebuilt ONLY when the tree reference changes (so it is
// NOT recomputed during the per-frame transform dispatches of an orbit/pan/zoom gesture, which
// leave `state.space.tree` untouched). Because tree mutations are structurally shared
// (`updateTreePlane`), an unchanged plane keeps the SAME node reference across rebuilds.
const buildPlaneIndex = (
    tree: TreePlane[],
): Map<string, TreePlane> => {
    const index = new Map<string, TreePlane>();
    const walk = (planes: TreePlane[]) => {
        for (const plane of planes) {
            if (plane.planeID) {
                index.set(plane.planeID, plane);
            }
            if (plane.children && plane.children.length > 0) {
                walk(plane.children);
            }
        }
    };
    walk(tree);
    return index;
};

export const getPlaneIndex = createSelector(
    [getTree],
    buildPlaneIndex,
);

/**
 * Factory for a PER-INSTANCE memoized "resolve a plane node by id" selector. Use one per
 * connected component (via `connect`'s `makeMapStateToProps` factory form) so each plane's
 * lookup is an O(1) `Map.get` off the shared, memoized index — instead of every plane walking
 * the whole tree on every dispatch (which made the orbit hot path O(n²)). Returns a STABLE
 * node reference for an unchanged plane, so `connect` can bail out of its re-render.
 */
export const makeGetTreePlaneByID = () => createSelector(
    [
        getPlaneIndex,
        (_state: AppState, planeID: string | undefined) => planeID,
    ],
    (index, planeID) => (planeID ? index.get(planeID) : undefined),
);


// #region link graph
export const getPlaneLinks = (state: AppState): PlaneLink[] => state.space.links;

/**
 * Factory for a memoized "links pointing TO this plane" selector (backlinks). One per connected
 * component (via `connect`'s `makeMapStateToProps` form). Recomputes only when `links` or the id
 * changes — NOT during the per-frame transform dispatches of an orbit (which leave `links` alone).
 */
export const makeGetBacklinks = () => createSelector(
    [
        getPlaneLinks,
        (_state: AppState, planeID: string | undefined) => planeID,
    ],
    (links, planeID) => (planeID
        ? links.filter(link => link.targetPlaneID === planeID)
        : []),
);

/**
 * Factory for a memoized "all edges incident to this plane" selector (either direction).
 */
export const makeGetLinksForPlane = () => createSelector(
    [
        getPlaneLinks,
        (_state: AppState, planeID: string | undefined) => planeID,
    ],
    (links, planeID) => (planeID
        ? links.filter(link =>
            link.sourcePlaneID === planeID
            || link.targetPlaneID === planeID)
        : []),
);
// #endregion link graph
// #endregion module
