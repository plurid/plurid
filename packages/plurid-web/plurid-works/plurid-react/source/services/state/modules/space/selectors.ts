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
    import {
        interaction,
        space as spaceEngine,
    } from '@plurid/plurid-engine';
    // #endregion libraries


    // #region external
    import {
        AppState,
    } from '~services/state/store';
    // #endregion external
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;

export const getSpace = (state: AppState) => state.space;
export const getLoading = (state: AppState): boolean => state.space.loading;
export const getResolvedLayout = (state: AppState): boolean => state.space.resolvedLayout;
export const getTransformMatrix = (state: AppState) => state.space.transform;
export const getTransformTime = (state: AppState): number => state.space.transformTime;

export const getCamera = (state: AppState) => state.space.camera;
export const getCameraLimits = (state: AppState) => state.space.cameraLimits;
export const getMotion = (state: AppState) => state.space.motion;
export const getPerspective = (state: AppState): number => state.space.camera.perspective;

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

export const getPresentation = (state: AppState): 'space' | 'page' => state.configuration?.space?.presentation ?? 'space';
const getPlaneElementConfiguration = (state: AppState) => state.configuration?.elements?.plane;
export const getDockingPlaneID = (state: AppState) => state.space.dockingPlaneID ?? '';
export const getDockingConfiguration = (state: AppState) => state.configuration?.space?.docking;

/**
 * THE DOCKED STATE of the page presentation: the id of the shown plane the camera is docked on
 * (face-on, scale 1, the plane's box exactly on the view), `''` when the camera is anywhere else
 * or in the space presentation. Derived from the camera, the tree and the view — never stored —
 * and memoized, so an orbit that stays undocked re-renders nothing. While a tween is DOCKING (its
 * destination is a page, `dockingPlaneID`) and `docking.chrome` is `hidden` (the default), the
 * destination page counts as docked for the whole swing: the chrome never paints between pages.
 */
export const getDockedPlaneID = createSelector(
    [getCamera, getTree, getViewSize, getPresentation, getPlaneElementConfiguration, getMotion, getDockingPlaneID, getDockingConfiguration],
    (camera, tree, view, presentation, plane, motion, dockingPlaneID, docking): string => {
        if (presentation !== 'page' || !plane) {
            return '';
        }
        // a docking swing: its destination is the page from the FIRST frame (the camera still sits
        // on the source page then; the destination must win over it)
        if (motion === 'tween' && dockingPlaneID && (docking?.chrome ?? 'hidden') === 'hidden') {
            return dockingPlaneID;
        }
        // the configured size (view-sized pages) over a measured one: a measurement lags a frame
        const configured = spaceEngine.layout.configuredPlaneSize({ elements: { plane } } as any, view);
        return cameraEngine.findDockedPlane(camera, tree, view, configured, docking?.epsilon);
    },
);
export const getCulledView = (state: AppState) => state.space.culledView;

export const getActivePlaneID = (state: AppState) => state.space.activePlaneID;
export const getIsolatePlane = (state: AppState) => state.space.isolatePlane;
export const getLastClosedPlane = (state: AppState) => state.space.lastClosedPlane;

export const getSelectedPlaneIDs = (state: AppState): string[] => state.space.selectedPlaneIDs;
export const getDraggingSelection = (state: AppState): boolean => state.space.draggingSelection;
/** Spatial undo/redo availability (`canUndo`, `canRedo`, depths), maintained by the history middleware. */
export const getHistory = (state: AppState) => state.space.history;
export const getBookmarks = (state: AppState) => state.space.bookmarks;
export const getHome = (state: AppState) => state.space.home;
export const getLayoutTransition = (state: AppState): number => state.space.layoutTransition;
export const getCulled = (state: AppState) => state.space.culled;

const NO_LINEAGE: ReadonlySet<string> = new Set();

/**
 * THE LINEAGE of the docked page (the page presentation): the page, its ancestors (the trail back
 * to the root) and its own descendants — what stays visible while the camera is docked on it (or a
 * swing is docking); every other plane is set ASIDE. Empty when nothing is docked. Derived like
 * the docked state, recomputed only when the docked page or the tree changes.
 */
export const getDockedLineage = createSelector(
    [getDockedPlaneID, getTree, getDockingConfiguration],
    (docked, tree, docking): ReadonlySet<string> => {
        if (!docked || docking?.aside === 'none') {
            return NO_LINEAGE;
        }
        const lineage = new Set<string>();
        for (const ancestor of spaceEngine.location.computePath(tree as any, docked)) {
            lineage.add(ancestor.planeID);
        }
        const page = spaceEngine.tree.logic.getTreePlaneByID(tree as any, docked);
        if (page) {
            lineage.add(page.planeID);
            spaceEngine.tree.fields.collectPlaneIDs(page.children ?? [], lineage);
        }
        return lineage;
    },
);

/** Factory: one memoized "is THIS plane set aside" selector per plane (in the tree, outside the docked lineage). */
export const makeGetIsPlaneAside = () => createSelector(
    [
        getDockedLineage,
        getPlaneIndex,
        (_state: AppState, planeID: string | undefined) => planeID,
    ],
    (lineage, index, planeID): boolean => !!planeID && lineage.size > 0 && index.has(planeID) && !lineage.has(planeID),
);

export type PlaneCullingState = 'visible' | 'hidden' | 'frozen';
/** Factory: one memoized "how is THIS plane culled" selector per plane. */
export const makeGetPlaneCulling = () => createSelector(
    [
        getCulled,
        (_state: AppState, planeID: string | undefined) => planeID,
    ],
    (culled, planeID): PlaneCullingState => {
        if (!planeID || !culled) {
            return 'visible';
        }
        if (culled.hidden.includes(planeID)) {
            return 'hidden';
        }
        if (culled.frozen.includes(planeID)) {
            return 'frozen';
        }
        return 'visible';
    },
);

/**
 * Factory for a memoized "is THIS plane selected" selector. One per connected plane (via `connect`'s
 * `makeMapStateToProps` form), so each plane reads a stable boolean and re-renders only when its own
 * selected-ness flips — not whenever any other plane's selection changes.
 */
export const makeGetIsPlaneSelected = () => createSelector(
    [
        getSelectedPlaneIDs,
        (_state: AppState, planeID: string | undefined) => planeID,
    ],
    (selectedPlaneIDs, planeID) => (planeID
        ? selectedPlaneIDs.includes(planeID)
        : false),
);


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

/** The parent of the docked page, `''` for a root or when nothing is docked (the rail's back control). */
export const getDockedParentPlaneID = createSelector(
    [getDockedPlaneID, getPlaneIndex],
    (docked, index): string => (docked ? (index.get(docked)?.parentPlaneID ?? '') : ''),
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
