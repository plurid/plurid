// #region imports
    // #region libraries
    import {
        createSlice,
        current,
        original,
        PayloadAction,
    } from '@reduxjs/toolkit';


    import {
    } from '@plurid/plurid-functions';

    import {
        /** constants */
        ROTATION_STEP,
        TRANSLATION_STEP,
        SCALE_STEP,

        PluridStateSpace,
        TreePlane,
        PlaneLink,
        SpaceLocation,
        SpaceTransform,
        PluridApplicationView,
        CameraState,
        CameraDelta,
        CameraLimits,
        CameraMotion,
        PluridStateHistory,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        interaction,
        space as spaceEngine,
    } from '~services/engine';
    // #endregion external


    // #region internal
    import {
        ViewSize,
        SpaceSize,
        SetSpaceFieldPayload,
        SetTransformPayload,
        UpdateSpaceLinkCoordinatesPayload,
        UpdatePlaneLinkPayload,
        TransformSelectedPlanesPayload,
        ZoomAtPointPayload,
        FitToViewPayload,
        SetPlaneSizePayload,
    } from './types';

    import * as selectors from './selectors';
    // #endregion internal
// #endregion imports



// #region module
const {
    camera: cameraEngine,
} = interaction;


const initialViewSize: ViewSize = {
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 821 : window.innerHeight,
};

const initialState: PluridStateSpace = {
    loading: true,
    resolvedLayout: false,
    transform: cameraEngine.IDENTITY_MATRIX3D,
    animatedTransform: false,
    transformTime: 450,
    camera: cameraEngine.identityCamera(initialViewSize),
    cameraLimits: cameraEngine.DEFAULT_CAMERA_LIMITS,
    motion: 'idle',
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    translationX: 0,
    translationY: 0,
    translationZ: 0,
    tree: [],
    links: [],
    activeUniverseID: '',
    viewSize: initialViewSize,
    spaceSize: {
        width: initialViewSize.width,
        height: initialViewSize.height,
        depth: 0,
        topCorner: {
            x: 0,
            y: 0,
            z: 0,
        },
    },
    view: [],
    culledView: [],
    activePlaneID: '',
    isolatePlane: '',
    lastClosedPlane: '',
    bookmarks: {},
    layoutTransition: 0,
    culled: {
        hidden: [],
        frozen: [],
    },
    selectedPlaneIDs: [],
    draggingSelection: false,
    history: {
        canUndo: false,
        canRedo: false,
        undoDepth: 0,
        redoDepth: 0,
    },
};


export const name = 'space' as const;


// #region camera commit
/**
 * THE camera commit path. Every camera mutation ends here: the camera is clamped to the limits,
 * stored, mirrored into the six legacy scalars, and rendered into `transform`. Nothing else writes
 * `transform` or the scalars.
 */
const commitCamera = (
    state: PluridStateSpace,
    next: CameraState,
) => {
    const camera = cameraEngine.clampCamera(next, state.cameraLimits);
    const legacy = cameraEngine.toLegacy(camera, state.viewSize);

    state.camera = camera;
    state.rotationX = legacy.rotationX;
    state.rotationY = legacy.rotationY;
    state.translationX = legacy.translationX;
    state.translationY = legacy.translationY;
    state.translationZ = legacy.translationZ;
    state.scale = legacy.scale;
    state.transform = cameraEngine.cameraMatrix3d(camera, state.viewSize);
};

const currentLegacy = (
    state: PluridStateSpace,
): SpaceTransform => ({
    rotationX: state.rotationX,
    rotationY: state.rotationY,
    translationX: state.translationX,
    translationY: state.translationY,
    translationZ: state.translationZ,
    scale: state.scale,
});

/** Commit from the legacy six scalars (the pivot re-parameterizes to the view center; lossless). */
const commitLegacy = (
    state: PluridStateSpace,
    transform: SpaceTransform,
) => {
    commitCamera(
        state,
        cameraEngine.fromLegacy(
            transform,
            state.viewSize,
            state.camera.perspective,
            state.cameraLimits,
        ),
    );
};

const applyDelta = (
    state: PluridStateSpace,
    delta: CameraDelta,
) => {
    const next = cameraEngine.applyCameraDelta(
        state.camera,
        delta,
        state.viewSize,
        state.cameraLimits,
    );
    if (next === state.camera) {
        return;
    }
    commitCamera(state, next);
};

const zoomAboutCenter = (
    state: PluridStateSpace,
    nextScale: number,
) => {
    if (nextScale <= 0 || nextScale === state.scale) {
        return;
    }
    applyDelta(state, {
        zoom: {
            factor: nextScale / state.scale,
        },
    });
};
// #endregion camera commit



/**
 * Re-place the plane spawned by a link from that link's fresh coordinates, equality-gated so a
 * re-measurement with nothing new leaves the tree reference untouched.
 */
const reduceLinkCoordinates = (
    state: { tree: TreePlane[] },
    payload: UpdateSpaceLinkCoordinatesPayload,
) => {
    const previousTree = original(state.tree) as TreePlane[] | undefined;
    if (!previousTree) {
        return;
    }

    const updatedTree = spaceEngine.tree.logic.updateLinkCoordinates(
        previousTree,
        payload.planeID,
        payload.linkCoordinates,
    );
    if (updatedTree !== previousTree) {
        state.tree = updatedTree;
    }
};


/** Drop link-graph edges whose planes no longer exist in `tree`; keeps the reference otherwise. */
const pruneStateLinks = (
    state: { links: PlaneLink[] },
    tree: TreePlane[],
) => {
    const previousLinks = (original(state.links) as PlaneLink[] | undefined) || [];
    const prunedLinks = spaceEngine.tree.fields.pruneLinks(
        previousLinks,
        spaceEngine.tree.fields.collectPlaneIDs(tree),
    );
    if (prunedLinks !== previousLinks) {
        state.links = prunedLinks;
    }
};



/** Every shown plane id, children included, in tree order. */
const collectShownPlaneIDs = (
    tree: TreePlane[],
): string[] => {
    const ids: string[] = [];
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            if (node.show === false) {
                continue;
            }
            ids.push(node.planeID);
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(tree);
    return ids;
};

const fallbackSizeOf = (
    payload: { fallbackWidth?: number; fallbackHeight?: number },
) => ({
    width: payload.fallbackWidth ?? 400,
    height: payload.fallbackHeight ?? 300,
});

/** Move the selected planes by one delta (pinning them) and re-place their subtrees. */
const moveSelected = (
    state: { tree: TreePlane[] },
    selected: Set<string>,
    dx: number,
    dy: number,
    dz: number,
) => {
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            if (selected.has(node.planeID)) {
                node.location.translateX += dx;
                node.location.translateY += dy;
                node.location.translateZ += dz;
                node.manuallyPositioned = true;
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(state.tree);
    state.tree = spaceEngine.location.recomputeTree(current(state.tree));
};

/** Move planes by per-plane deltas (pinning them) and re-place their subtrees. */
const moveEach = (
    state: { tree: TreePlane[] },
    deltas: Map<string, { dx: number; dy: number }>,
) => {
    let moved = false;
    const walk = (nodes: TreePlane[]) => {
        for (const node of nodes) {
            const delta = deltas.get(node.planeID);
            if (delta && (delta.dx !== 0 || delta.dy !== 0)) {
                node.location.translateX += delta.dx;
                node.location.translateY += delta.dy;
                node.manuallyPositioned = true;
                moved = true;
            }
            if (node.children) {
                walk(node.children);
            }
        }
    };
    walk(state.tree);
    if (moved) {
        state.tree = spaceEngine.location.recomputeTree(current(state.tree));
    }
};


export interface SnapSelectionPayload {
    threshold?: number;
    grid?: number;
    fallbackWidth?: number;
    fallbackHeight?: number;
}

export interface AlignSelectionPayload {
    edge: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY';
    fallbackWidth?: number;
    fallbackHeight?: number;
}

export interface DistributeSelectionPayload {
    axis: 'x' | 'y';
    fallbackWidth?: number;
    fallbackHeight?: number;
}

export interface DuplicateSelectionPayload {
    offset?: number;
}

export interface SetPlaneShowPayload {
    planeID: string;
    show: boolean;
}

export const space = createSlice({
    name,
    initialState,
    reducers: {
        setSpaceField: (
            state,
            action: PayloadAction<SetSpaceFieldPayload>,
        ) => {
            const {
                field,
                value,
            } = action.payload;

            (state as any)[field] = value;
        },
        setSpaceLoading: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.loading = action.payload;
        },

        // #region camera
        /** Apply one `CameraDelta` (pivot / orbit / look / pan / dolly / fly / zoom / absolute). */
        applyCameraDelta: (
            state,
            action: PayloadAction<CameraDelta>,
        ) => {
            applyDelta(state, action.payload);
        },
        /** Set the camera (a full state, or a partial merged over the current one). */
        setCamera: (
            state,
            action: PayloadAction<Partial<CameraState>>,
        ) => {
            commitCamera(state, {
                ...state.camera,
                ...action.payload,
                pivot: action.payload.pivot
                    ? { ...action.payload.pivot }
                    : state.camera.pivot,
                offset: action.payload.offset
                    ? { ...action.payload.offset }
                    : state.camera.offset,
            });
        },
        /** Set the camera from the legacy six scalars (e.g. a v1 viewpoint). */
        setCameraFromLegacy: (
            state,
            action: PayloadAction<SpaceTransform>,
        ) => {
            commitLegacy(state, action.payload);
        },
        setCameraLimits: (
            state,
            action: PayloadAction<CameraLimits>,
        ) => {
            state.cameraLimits = action.payload;
            commitCamera(state, state.camera);
        },
        setPerspective: (
            state,
            action: PayloadAction<number>,
        ) => {
            const perspective = action.payload;
            if (!Number.isFinite(perspective) || perspective <= 0 || perspective === state.camera.perspective) {
                return;
            }
            commitCamera(state, {
                ...state.camera,
                perspective,
            });
        },
        setMotion: (
            state,
            action: PayloadAction<CameraMotion>,
        ) => {
            if (state.motion !== action.payload) {
                state.motion = action.payload;
            }
        },
        setTransform: (
            state,
            action: PayloadAction<SetTransformPayload>,
        ) => {
            const current = currentLegacy(state);
            commitLegacy(state, {
                translationX: action.payload.translationX ?? current.translationX,
                translationY: action.payload.translationY ?? current.translationY,
                translationZ: action.payload.translationZ ?? current.translationZ,
                rotationX: action.payload.rotationX ?? current.rotationX,
                rotationY: action.payload.rotationY ?? current.rotationY,
                scale: action.payload.scale ?? current.scale,
            });
        },
        setAnimatedTransform: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.animatedTransform = action.payload;
        },
        setTransformTime: (
            state,
            action: PayloadAction<number>,
        ) => {
            state.transformTime = action.payload;
        },
        setSpaceLocation: (
            state,
            action: PayloadAction<Partial<SpaceLocation>>,
        ) => {
            commitLegacy(state, {
                ...currentLegacy(state),
                ...action.payload,
            });
        },

        // Camera-relative steps (the "view camera" moves): dolly and screen-space pan.
        viewCameraMoveForward: (state) => {
            applyDelta(state, { dolly: TRANSLATION_STEP * 6 });
        },
        viewCameraMoveBackward: (state) => {
            applyDelta(state, { dolly: -TRANSLATION_STEP * 6 });
        },
        viewCameraMoveLeft: (state) => {
            applyDelta(state, { pan: { x: TRANSLATION_STEP * 3, y: 0 } });
        },
        viewCameraMoveRight: (state) => {
            applyDelta(state, { pan: { x: -TRANSLATION_STEP * 3, y: 0 } });
        },
        viewCameraMoveUp: (state) => {
            applyDelta(state, { pan: { x: 0, y: TRANSLATION_STEP * 3 } });
        },
        viewCameraMoveDown: (state) => {
            applyDelta(state, { pan: { x: 0, y: -TRANSLATION_STEP * 3 } });
        },
        viewCameraTurnUp: (state) => {
            applyDelta(state, { pitch: ROTATION_STEP });
        },
        viewCameraTurnDown: (state) => {
            applyDelta(state, { pitch: -ROTATION_STEP });
        },
        viewCameraTurnLeft: (state) => {
            applyDelta(state, { yaw: ROTATION_STEP });
        },
        viewCameraTurnRight: (state) => {
            applyDelta(state, { yaw: -ROTATION_STEP });
        },

        rotateUp: (state) => {
            applyDelta(state, { pitch: ROTATION_STEP });
        },
        rotateDown: (state) => {
            applyDelta(state, { pitch: -ROTATION_STEP });
        },
        rotateX: (
            state,
            action: PayloadAction<number>,
        ) => {
            applyDelta(state, { absolute: { pitch: action.payload } });
        },
        rotateXWith: (
            state,
            action: PayloadAction<number>,
        ) => {
            applyDelta(state, { pitch: action.payload });
        },
        rotateLeft: (state) => {
            applyDelta(state, { yaw: ROTATION_STEP });
        },
        rotateRight: (state) => {
            applyDelta(state, { yaw: -ROTATION_STEP });
        },
        rotateY: (
            state,
            action: PayloadAction<number>,
        ) => {
            applyDelta(state, { absolute: { yaw: action.payload } });
        },
        rotateYWith: (
            state,
            action: PayloadAction<number>,
        ) => {
            applyDelta(state, { yaw: action.payload });
        },

        // Screen-space pan: exact at any orientation (the content on the pivot-depth plane follows).
        translateUp: (state) => {
            applyDelta(state, { pan: { x: 0, y: -TRANSLATION_STEP } });
        },
        translateDown: (state) => {
            applyDelta(state, { pan: { x: 0, y: TRANSLATION_STEP } });
        },
        translateLeft: (state) => {
            applyDelta(state, { pan: { x: -TRANSLATION_STEP, y: 0 } });
        },
        translateRight: (state) => {
            applyDelta(state, { pan: { x: TRANSLATION_STEP, y: 0 } });
        },
        translateIn: (state) => {
            applyDelta(state, { dolly: -TRANSLATION_STEP * 3 });
        },
        translateOut: (state) => {
            applyDelta(state, { dolly: TRANSLATION_STEP * 3 });
        },
        translateXWith: (
            state,
            action: PayloadAction<number>,
        ) => {
            applyDelta(state, { pan: { x: action.payload, y: 0 } });
        },
        translateYWith: (
            state,
            action: PayloadAction<number>,
        ) => {
            applyDelta(state, { pan: { x: 0, y: action.payload } });
        },
        translateZWith: (
            state,
            action: PayloadAction<number>,
        ) => {
            applyDelta(state, { dolly: action.payload });
        },

        // Zoom: one multiplicative `zoomAt` for every path; the stepped actions zoom about the view
        // center by the legacy additive step so their feel is unchanged.
        scaleUp: (state) => {
            zoomAboutCenter(state, state.scale + SCALE_STEP);
        },
        scaleDown: (state) => {
            zoomAboutCenter(state, state.scale - SCALE_STEP);
        },
        scaleUpWith: (
            state,
            action: PayloadAction<number>,
        ) => {
            zoomAboutCenter(state, state.scale + Math.abs(action.payload));
        },
        scaleDownWith: (
            state,
            action: PayloadAction<number>,
        ) => {
            zoomAboutCenter(state, state.scale - Math.abs(action.payload));
        },
        /**
         * Zoom toward a view point (the cursor, a pinch midpoint) keeping the content under it
         * fixed — exact at any orientation. `factor` is multiplicative; `deltaScale` (additive, the
         * legacy payload) is still accepted.
         */
        zoomAtPoint: (
            state,
            action: PayloadAction<ZoomAtPointPayload>,
        ) => {
            const {
                deltaScale,
                factor,
                originX,
                originY,
            } = action.payload;

            const resolvedFactor = factor !== undefined
                ? factor
                : (state.scale + (deltaScale || 0)) / state.scale;

            applyDelta(state, {
                zoom: {
                    factor: resolvedFactor,
                    anchor: {
                        x: originX,
                        y: originY,
                    },
                },
            });
        },

        /**
         * Continuous first-person step: look (about the eye) + camera-relative movement. `strafe`
         * keeps the legacy sign (positive moves the content to the right).
         */
        flyMove: (
            state,
            action: PayloadAction<{
                forward?: number;
                strafe?: number;
                vertical?: number;
                yaw?: number;
                pitch?: number;
            }>,
        ) => {
            const {
                forward = 0,
                strafe = 0,
                vertical = 0,
                yaw = 0,
                pitch = 0,
            } = action.payload;

            applyDelta(state, {
                ...((yaw !== 0 || pitch !== 0) ? { look: { yaw, pitch } } : {}),
                ...((forward !== 0 || strafe !== 0 || vertical !== 0)
                    ? { fly: { forward, strafe: -strafe, vertical } }
                    : {}),
            });
        },

        spaceResetTransform: (state) => {
            commitCamera(
                state,
                cameraEngine.identityCamera(state.viewSize, state.camera.perspective),
            );
        },
        /**
         * Frame every visible plane (children included) from their MEASURED extents, front-on by
         * default. Planes not yet measured use the fallback size the caller derives from the
         * configured plane width.
         */
        spaceFitToView: (
            state,
            action: PayloadAction<FitToViewPayload | undefined>,
        ) => {
            const payload = action.payload || {};
            const tree = original(state.tree) as TreePlane[] | undefined;
            if (!tree || tree.length === 0) {
                return;
            }

            const fitted = cameraEngine.fitAll(
                state.camera,
                tree,
                state.viewSize,
                {
                    faceOn: payload.faceOn ?? true,
                    margin: payload.margin,
                    fallbackWidth: payload.fallbackWidth,
                    fallbackHeight: payload.fallbackHeight,
                    limits: state.cameraLimits,
                },
            );
            commitCamera(state, fitted);
        },
        setViewSize: (
            state,
            action: PayloadAction<ViewSize>,
        ) => {
            const {
                width,
                height,
            } = action.payload;
            if (width === state.viewSize.width && height === state.viewSize.height) {
                return;
            }
            state.viewSize = action.payload;
            // Keep the PICTURE anchored, not the pivot: re-derive the camera from the legacy
            // scalars about the new center. At rotation 0 nothing moves (a fresh identity space
            // stays identity when the measured view replaces the window guess, and the layout's
            // top-left-origin coordinates keep lining up); under rotation the orbit pivot follows
            // the new center, as it always did.
            commitLegacy(state, currentLegacy(state));
        },
        // #endregion camera

        setTree: (
            state,
            action: PayloadAction<TreePlane[]>,
        ) => {
            // Structural-sharing reconciliation against the REAL previous references (immer's
            // `original`, not the draft proxy or a `current` copy — those would defeat the
            // referential equality consumers rely on). Producers rebuild the whole tree from
            // scratch on relayout/spawn; this swaps every unchanged subtree back to its prior
            // reference so only genuinely-changed planes re-render.
            const previousTree = original(state.tree) as TreePlane[] | undefined;
            const nextTree = spaceEngine.tree.logic.reconcileTree(
                previousTree,
                action.payload,
            );
            state.tree = nextTree;
            pruneStateLinks(state, nextTree);
        },
        setActiveUniverse: (
            state,
            action: PayloadAction<string>,
        ) => {
            state.activeUniverseID = action.payload;
        },
        setSpaceSize: (
            state,
            action: PayloadAction<SpaceSize>,
        ) => {
            state.spaceSize = action.payload;
        },
        updateSpaceTreePlane: (
            state,
            action: PayloadAction<TreePlane>,
        ) => {
            const previousTree = original(state.tree) as TreePlane[] | undefined;
            if (!previousTree) {
                return;
            }
            const updatedTree = spaceEngine.tree.fields.updateTreePlaneFields(
                previousTree,
                action.payload.planeID,
                action.payload,
            );
            if (updatedTree !== previousTree) {
                state.tree = updatedTree;
            }
        },
        /**
         * The measured (or manually set) size of one plane. Structurally shared and equality-gated:
         * the tree reference is untouched when the size did not change, so a ResizeObserver
         * re-report costs nothing downstream.
         */
        setPlaneSize: (
            state,
            action: PayloadAction<SetPlaneSizePayload>,
        ) => {
            const {
                planeID,
                width,
                height,
                sizeMode,
            } = action.payload;

            const previousTree = original(state.tree) as TreePlane[] | undefined;
            if (!previousTree) {
                return;
            }

            // A MEASURED report (no `sizeMode`) never overrides a hand-sized plane: the observer
            // may still fire once for the size the resize itself set.
            if (!sizeMode) {
                const existing = spaceEngine.tree.logic.getTreePlaneByID(previousTree, planeID);
                if (existing?.sizeMode === 'manual') {
                    return;
                }
            }

            const patch: Partial<TreePlane> = {
                width,
                height,
            };
            if (sizeMode) {
                patch.sizeMode = sizeMode;
            }

            const updatedTree = spaceEngine.tree.fields.updateTreePlaneFields(
                previousTree,
                planeID,
                patch,
            );
            if (updatedTree !== previousTree) {
                state.tree = updatedTree;
            }
        },
        /**
         * A link's measured position on its plane changed: re-place the spawned plane (and its
         * subtree) from the LIVE parent. Equality-gated — equal coordinates leave the tree reference
         * untouched, so a re-measurement that found nothing new dispatches into a no-op.
         */
        updateLinkCoordinates: (
            state,
            action: PayloadAction<UpdateSpaceLinkCoordinatesPayload>,
        ) => {
            reduceLinkCoordinates(state, action.payload);
        },
        /** @deprecated Alias of `updateLinkCoordinates`. */
        updateSpaceLinkCoordinates: (
            state,
            action: PayloadAction<UpdateSpaceLinkCoordinatesPayload>,
        ) => {
            reduceLinkCoordinates(state, action.payload);
        },
        spaceSetView: (
            state,
            action: PayloadAction<PluridApplicationView>,
        ) => {
            state.view = action.payload;
        },
        spaceSetCulledView: (
            state,
            action: PayloadAction<PluridApplicationView>,
        ) => {
            state.culledView = action.payload;
        },

        /** Show or hide one plane (root or child); hiding records it as the last closed plane. */
        setPlaneShow: (
            state,
            action: PayloadAction<SetPlaneShowPayload>,
        ) => {
            const {
                planeID,
                show,
            } = action.payload;

            const previousTree = original(state.tree) as TreePlane[] | undefined;
            if (!previousTree) {
                return;
            }

            const {
                updatedTree,
            } = spaceEngine.tree.logic.togglePlaneFromTree(previousTree, planeID, show);
            if (updatedTree !== previousTree) {
                state.tree = updatedTree;
            }
            if (!show) {
                state.lastClosedPlane = planeID;
            }
        },

        /**
         * Delete a plane and its subtree. Path-copies (no deep clone of the whole tree) and prunes
         * the link graph of edges that pointed at the removed planes.
         */
        removePlane: (
            state,
            action: PayloadAction<string>,
        ) => {
            const previousTree = original(state.tree) as TreePlane[] | undefined;
            if (!previousTree) {
                return;
            }

            const updatedTree = spaceEngine.tree.logic.removePlaneFromTree(
                previousTree,
                action.payload,
            );
            if (updatedTree === previousTree) {
                return;
            }

            state.tree = updatedTree;
            pruneStateLinks(state, updatedTree);
        },

        // #region link graph
        // Arbitrary plane↔plane relationships, kept separate from the parent→child `tree`.
        addPlaneLink: (
            state,
            action: PayloadAction<PlaneLink>,
        ) => {
            const link = action.payload;
            // A plane cannot be linked to itself.
            if (link.sourcePlaneID === link.targetPlaneID) {
                return;
            }
            const exists = state.links.some(existing =>
                existing.id === link.id
                || (existing.sourcePlaneID === link.sourcePlaneID
                    && existing.targetPlaneID === link.targetPlaneID
                    && existing.kind === link.kind)
            );
            if (!exists) {
                state.links.push(link);
            }
        },
        removePlaneLink: (
            state,
            action: PayloadAction<string>,
        ) => {
            state.links = state.links.filter(
                link => link.id !== action.payload,
            );
        },
        updatePlaneLink: (
            state,
            action: PayloadAction<UpdatePlaneLinkPayload>,
        ) => {
            const {
                id,
                update,
            } = action.payload;
            const link = state.links.find(link => link.id === id);
            if (link) {
                // The id is the link's identity: it cannot be rewritten through an update.
                const fields: Partial<PlaneLink> = { ...update };
                delete fields.id;
                Object.assign(link, fields);
            }
        },
        setPlaneLinks: (
            state,
            action: PayloadAction<PlaneLink[]>,
        ) => {
            state.links = action.payload;
        },
        // Atomically replace the whole authored arrangement (tree + links) in ONE action — set
        // DIRECTLY (no `reconcileTree`), so an undo restore or a remote collaboration apply lands
        // EXACTLY, overriding the pinned-location carry in `reconcileNode`. One dispatch = one render,
        // which is what keeps the collaboration echo guard + the undo restore atomic.
        restoreArrangement: (
            state,
            action: PayloadAction<{ tree: TreePlane[]; links: PlaneLink[] }>,
        ) => {
            state.tree = action.payload.tree;
            state.links = spaceEngine.tree.fields.pruneLinks(
                action.payload.links,
                spaceEngine.tree.fields.collectPlaneIDs(action.payload.tree),
            );
        },
        // #endregion link graph

        // #region navigation memory
        setBookmark: (
            state,
            action: PayloadAction<{ name: string; viewpoint: string }>,
        ) => {
            state.bookmarks = {
                ...(state.bookmarks || {}),
                [action.payload.name]: action.payload.viewpoint,
            };
        },
        removeBookmark: (
            state,
            action: PayloadAction<string>,
        ) => {
            if (!state.bookmarks || !(action.payload in state.bookmarks)) {
                return;
            }
            const next = { ...state.bookmarks };
            delete next[action.payload];
            state.bookmarks = next;
        },
        setHome: (
            state,
            action: PayloadAction<string | undefined>,
        ) => {
            state.home = action.payload;
        },
        /** ms of plane placement transition for an animated relayout (0 = none). */
        setLayoutTransition: (
            state,
            action: PayloadAction<number>,
        ) => {
            if (state.layoutTransition !== action.payload) {
                state.layoutTransition = action.payload;
            }
        },
        /** The culling pass's result (equality-gated by the caller). */
        setCulled: (
            state,
            action: PayloadAction<{ hidden: string[]; frozen: string[] }>,
        ) => {
            state.culled = action.payload;
        },
        // #endregion navigation memory

        // #region selection
        // A multi-selection working set, distinct from the hover-driven `activePlaneID`.
        setSelection: (
            state,
            action: PayloadAction<string[]>,
        ) => {
            // Dedupe defensively; selection is a set.
            state.selectedPlaneIDs = [...new Set(action.payload)];
        },
        toggleSelection: (
            state,
            action: PayloadAction<string>,
        ) => {
            const id = action.payload;
            if (state.selectedPlaneIDs.includes(id)) {
                state.selectedPlaneIDs = state.selectedPlaneIDs.filter(s => s !== id);
            } else {
                state.selectedPlaneIDs.push(id);
            }
        },
        addToSelection: (
            state,
            action: PayloadAction<string>,
        ) => {
            const id = action.payload;
            if (!state.selectedPlaneIDs.includes(id)) {
                state.selectedPlaneIDs.push(id);
            }
        },
        clearSelection: (
            state,
        ) => {
            if (state.selectedPlaneIDs.length > 0) {
                state.selectedPlaneIDs = [];
            }
        },
        setDraggingSelection: (
            state,
            action: PayloadAction<boolean>,
        ) => {
            state.draggingSelection = action.payload;
        },
        // Move every selected plane by a delta (space-local units) and pin it. Mutates the tree
        // DIRECTLY (Immer, no `reconcileTree`) so the move lands; `manuallyPositioned` then makes the
        // reconcile carry this location across later relayouts — see `reconcileNode`.
        transformSelectedPlanes: (
            state,
            action: PayloadAction<TransformSelectedPlanesPayload>,
        ) => {
            const {
                deltaX = 0,
                deltaY = 0,
                deltaZ = 0,
            } = action.payload;

            if (state.selectedPlaneIDs.length === 0
                || (deltaX === 0 && deltaY === 0 && deltaZ === 0)) {
                return;
            }

            const selected = new Set(state.selectedPlaneIDs);
            const walk = (nodes: TreePlane[]) => {
                for (const node of nodes) {
                    if (selected.has(node.planeID)) {
                        node.location.translateX += deltaX;
                        node.location.translateY += deltaY;
                        node.location.translateZ += deltaZ;
                        node.manuallyPositioned = true;
                    }
                    if (node.children) {
                        walk(node.children);
                    }
                }
            };
            walk(state.tree);

            // Spawned children ride with their moved parent: re-place every subtree from its
            // (now moved) root. `current` gives the post-move plain tree; unmoved subtrees keep
            // their references, so this is a per-root check, not a rebuild.
            state.tree = spaceEngine.location.recomputeTree(current(state.tree));
        },
        // Edge-align the selection to nearby planes (typically on drag-release): find the smallest
        // X- and Y-offset (each within `threshold`) that lines a selected plane's left/top edge up with
        // an un-selected plane's, then shift the WHOLE selection by it so the group stays cohesive.
        // Operates on `location` (left/top corners), which live on the tree — plane SIZES are DOM-only.
        /** Every shown plane, children included. */
        selectAll: (
            state,
        ) => {
            state.selectedPlaneIDs = collectShownPlaneIDs(original(state.tree) as TreePlane[]);
        },
        invertSelection: (
            state,
        ) => {
            const selected = new Set(state.selectedPlaneIDs);
            state.selectedPlaneIDs = collectShownPlaneIDs(original(state.tree) as TreePlane[])
                .filter((id) => !selected.has(id));
        },
        /**
         * Snap the selection after a drag through the SHARED snap engine (the same one the
         * alignment guides preview with): the nearest edge/center of another plane within the
         * threshold, else the grid. Spawned children follow their parent.
         */
        snapSelection: (
            state,
            action: PayloadAction<SnapSelectionPayload | undefined>,
        ) => {
            const payload = action.payload || {};
            if (state.selectedPlaneIDs.length === 0) {
                return;
            }
            const tree = original(state.tree) as TreePlane[];
            const selected = new Set(state.selectedPlaneIDs);
            const fallback = fallbackSizeOf(payload);
            const {
                selection,
                others,
            } = spaceEngine.snap.collectSnapBoxes(tree, selected, fallback);
            if (selection.length === 0) {
                return;
            }
            const {
                dx,
                dy,
            } = spaceEngine.snap.computeSnap(selection, others, {
                threshold: payload.threshold,
                grid: payload.grid,
            });
            if (dx === 0 && dy === 0) {
                return;
            }
            moveSelected(state, selected, dx, dy, 0);
        },
        /** Line the selection up on an edge of its own bounds (left/right/top/bottom/centers). */
        alignSelection: (
            state,
            action: PayloadAction<AlignSelectionPayload>,
        ) => {
            const {
                edge,
            } = action.payload;
            const tree = original(state.tree) as TreePlane[];
            const selected = new Set(state.selectedPlaneIDs);
            const {
                selection,
            } = spaceEngine.snap.collectSnapBoxes(tree, selected, fallbackSizeOf(action.payload));
            const bounds = spaceEngine.snap.boxesBounds(selection);
            if (!bounds || selection.length < 2) {
                return;
            }
            const deltas = new Map<string, { dx: number; dy: number }>();
            for (const box of selection) {
                let dx = 0;
                let dy = 0;
                switch (edge) {
                    case 'left': dx = bounds.left - box.left; break;
                    case 'right': dx = bounds.right - box.right; break;
                    case 'centerX': dx = (bounds.left + bounds.right) / 2 - (box.left + box.right) / 2; break;
                    case 'top': dy = bounds.top - box.top; break;
                    case 'bottom': dy = bounds.bottom - box.bottom; break;
                    case 'centerY': dy = (bounds.top + bounds.bottom) / 2 - (box.top + box.bottom) / 2; break;
                    default: break;
                }
                deltas.set(box.id, { dx, dy });
            }
            moveEach(state, deltas);
        },
        /** Equal gaps between the selected planes along an axis (3+ planes; the outer two stay). */
        distributeSelection: (
            state,
            action: PayloadAction<DistributeSelectionPayload>,
        ) => {
            const {
                axis,
            } = action.payload;
            const tree = original(state.tree) as TreePlane[];
            const selected = new Set(state.selectedPlaneIDs);
            const {
                selection,
            } = spaceEngine.snap.collectSnapBoxes(tree, selected, fallbackSizeOf(action.payload));
            if (selection.length < 3) {
                return;
            }
            const start = axis === 'x' ? 'left' : 'top';
            const end = axis === 'x' ? 'right' : 'bottom';
            const ordered = [...selection].sort((a, b) => a[start] - b[start]);
            const span = ordered[ordered.length - 1][end] - ordered[0][start];
            const sizes = ordered.reduce((sum, box) => sum + (box[end] - box[start]), 0);
            const gap = (span - sizes) / (ordered.length - 1);
            const deltas = new Map<string, { dx: number; dy: number }>();
            let cursor = ordered[0][start];
            for (const box of ordered) {
                const delta = cursor - box[start];
                deltas.set(box.id, axis === 'x' ? { dx: delta, dy: 0 } : { dx: 0, dy: delta });
                cursor += (box[end] - box[start]) + gap;
            }
            moveEach(state, deltas);
        },
        /** Copies of the selected ROOT planes, offset, pinned, without children; the copies become the selection. */
        duplicateSelection: (
            state,
            action: PayloadAction<DuplicateSelectionPayload | undefined>,
        ) => {
            const offset = action.payload?.offset ?? 40;
            const tree = original(state.tree) as TreePlane[];
            const selected = new Set(state.selectedPlaneIDs);
            const roots = tree.filter((root) => selected.has(root.planeID));
            if (roots.length === 0) {
                return;
            }
            const taken = new Set(spaceEngine.tree.fields.collectPlaneIDs(tree));
            const copies: TreePlane[] = roots.map((root) => {
                let counter = 2;
                while (taken.has(`${root.planeID}~${counter}`)) {
                    counter += 1;
                }
                const planeID = `${root.planeID}~${counter}`;
                taken.add(planeID);
                const {
                    children: _children,
                    parentPlaneID: _parent,
                    spawnedByLinkID: _link,
                    linkCoordinates: _coordinates,
                    ...rest
                } = root;
                return {
                    ...rest,
                    planeID,
                    manuallyPositioned: true,
                    location: {
                        ...root.location,
                        translateX: root.location.translateX + offset,
                        translateY: root.location.translateY + offset,
                    },
                };
            });
            state.tree = [...tree, ...copies];
            state.selectedPlaneIDs = copies.map((copy) => copy.planeID);
        },
        // #endregion selection

        // No-op markers — the history middleware intercepts `space/undo` + `space/redo` and does the
        // real work (re-dispatching `setTree` with a snapshot). Defined here only so RTK generates
        // the `undo()` / `redo()` action creators + their types.
        undo: (_state) => {},
        redo: (_state) => {},
        // History TRANSACTIONS — also intercepted by the middleware: everything between a begin and
        // its matching end (a whole drag, a resize) records as ONE undo entry.
        historyBegin: (_state) => {},
        historyEnd: (_state) => {},
        /** Written by the history middleware after every stack change. */
        setHistoryStatus: (
            state,
            action: PayloadAction<PluridStateHistory>,
        ) => {
            const next = action.payload;
            const current = state.history;
            if (
                current.canUndo !== next.canUndo
                || current.canRedo !== next.canRedo
                || current.undoDepth !== next.undoDepth
                || current.redoDepth !== next.redoDepth
            ) {
                state.history = next;
            }
        },
    },
});
// #endregion module



// #region exports
export const actions = space.actions;

export {
    selectors,
};

export const reducer = space.reducer;
// #endregion exports
