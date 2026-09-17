// #region imports
    // #region external
    import {
        PLURID_PUBSUB_TOPIC,
    } from '~constants/pubsub';

    import {
        PluridPartialConfiguration,
    } from '~interfaces/external/configuration';

    import {
        PlaneLink,
        TreePlane,
    } from '~interfaces/internal/tree';

    import {
        CameraDelta,
        CameraState,
    } from '~interfaces/internal/camera';
    // #endregion external
// #endregion imports



// #region module
export type PluridPubSubCallback<D = any> = (
    data: D,
) => void;



export interface PluridPubSubDataValueNumber {
    value: number;
}

export interface PluridPubSubDataValueString {
    value: string;
}




export interface PluridPubSubPublishMessageConfiguration {
    topic: typeof PLURID_PUBSUB_TOPIC.CONFIGURATION;
    data: PluridPartialConfiguration;
}
export interface PluridPubSubSubscribeMessageConfiguration {
    topic: typeof PLURID_PUBSUB_TOPIC.CONFIGURATION;
    callback: PluridPubSubCallback<PluridPartialConfiguration>;
}





export interface PluridPubSubPublishMessageSpaceRotateXWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceRotateYWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceRotateXWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceRotateYWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}

export interface PluridPubSubPublishMessageSpaceRotateXTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceRotateYTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceRotateXTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_X_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceRotateYTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_Y_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}




export interface PluridPubSubPublishMessageSpaceTranslateXWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateYWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateZWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_WITH;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateXWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateYWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateZWith {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_WITH;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}

export interface PluridPubSubPublishMessageSpaceTranslateXTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateYTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubPublishMessageSpaceTranslateZTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_TO;
    data: PluridPubSubDataValueNumber;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateXTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_X_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateYTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Y_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}
export interface PluridPubSubSubscribeMessageSpaceTranslateZTo {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_Z_TO;
    callback: PluridPubSubCallback<PluridPubSubDataValueNumber>;
}





export interface SpaceTransform {
    rotationX: number;
    rotationY: number;
    translationX: number;
    translationY: number;
    translationZ: number;
    scale: number;
}
export interface PluridPubSubMessageSpaceTransformData {
    value: Partial<SpaceTransform>;
    /** The full camera, published alongside the legacy scalars on the internal re-publish. */
    camera?: CameraState;
    internal?: boolean;
}
export interface PluridPubSubPublishMessageSpaceTransform {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM;
    data?: PluridPubSubMessageSpaceTransformData;
}
export interface PluridPubSubSubscribeMessageSpaceTransform {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSFORM;
    callback: PluridPubSubCallback<PluridPubSubMessageSpaceTransformData>;
}


export interface PluridPubSubMessageViewAddPlaneData {
    /** the route of the plane to add to the view */
    planeID?: string;
    /**
     * A CORRELATION TOKEN, so the host learns which plane this became.
     *
     * A plane's identity used to be reachable only through the DOM: publish a
     * route, guess a delay (`setTimeout(450)`), then
     * `querySelector('[data-plurid-plane*=…]')` — which returns the FIRST
     * match, so one route open twice addressed the wrong plane. Two separate
     * products wrote that same workaround, which is what a missing API looks
     * like.
     *
     * Pass any string here and the engine answers on `space.changed` with kind
     * `plane` once the plane is in the tree: `{ token, planeID, route,
     * parameters }`. No delay to guess, no DOM to query, and two planes of one
     * route are distinguishable.
     */
    token?: string;
}
export interface PluridPubSubPublishMessageViewAddPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE;
    data: PluridPubSubMessageViewAddPlaneData;
}
export interface PluridPubSubSubscribeMessageViewAddPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_ADD_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageViewAddPlaneData>;
}

export interface PluridPubSubMessageViewSetPlanesData {
    view: string[];
}
export interface PluridPubSubPublishMessageViewSetPlanes {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES;
    data?: PluridPubSubMessageViewSetPlanesData;
}
export interface PluridPubSubSubscribeMessageViewSetPlanes {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_SET_PLANES;
    // The pubsub delivers `message.data` to the callback (see `PluridPubSub.publish`), so the
    // callback's param is the DATA payload — matching every other subscribe message (e.g.
    // CONFIGURATION → `PluridPubSubCallback<PluridPartialConfiguration>`). This previously passed
    // the whole publish-message type by mistake, so `const { view } = data` failed to type-check.
    callback: PluridPubSubCallback<PluridPubSubMessageViewSetPlanesData>;
}

export interface PluridPubSubMessageViewRemovePlaneData {
    planeID?: string;
}
export interface PluridPubSubPublishMessageViewRemovePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE;
    data: PluridPubSubMessageViewRemovePlaneData;
}
export interface PluridPubSubSubscribeMessageViewRemovePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.VIEW_REMOVE_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageViewRemovePlaneData>;
}

export interface PluridPubSubMessageNavigateToPlane {
    planeID?: string;
    /** face-on (`plane`, the default: the topic names ONE plane) or with its parent from the yaw between them (`pair`) */
    framing?: 'pair' | 'plane';
}
export interface PluridPubSubPublishMessageNavigateToPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE;
    data: PluridPubSubMessageNavigateToPlane;
}
export interface PluridPubSubSubscribeMessageNavigateToPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.NAVIGATE_TO_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageNavigateToPlane>;
}

export interface PluridPubSubMessageRefreshPlane {
    planeID?: string;
}
export interface PluridPubSubPublishMessageRefreshPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.REFRESH_PLANE;
    data: PluridPubSubMessageRefreshPlane;
}
export interface PluridPubSubSubscribeMessageRefreshPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.REFRESH_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageRefreshPlane>;
}

export interface PluridPubSubMessageIsolatePlane {
    planeID?: string;
}
export interface PluridPubSubPublishMessageIsolatePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.ISOLATE_PLANE;
    data: PluridPubSubMessageIsolatePlane;
}
export interface PluridPubSubSubscribeMessageIsolatePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.ISOLATE_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageIsolatePlane>;
}

export interface PluridPubSubPublishMessageOpenClosedPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.OPEN_CLOSED_PLANE;
    data?: any;
}
export interface PluridPubSubSubscribeMessageOpenClosedPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.OPEN_CLOSED_PLANE;
    callback: PluridPubSubCallback<any>;
}

export interface PluridPubSubMessageClosePlane {
    planeID?: string;
    /** Where the camera goes when the closed plane is in view; defaults to `space.navigation.onClose`. */
    navigate?: 'parent' | 'stay';
}
export interface PluridPubSubPublishMessageClosePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.CLOSE_PLANE;
    data: PluridPubSubMessageClosePlane;
}
export interface PluridPubSubSubscribeMessageClosePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.CLOSE_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageClosePlane>;
}

export interface PluridPubSubPublishMessagePreviousRoot {
    topic: typeof PLURID_PUBSUB_TOPIC.PREVIOUS_ROOT;
    data?: any;
}
export interface PluridPubSubSubscribeMessagePreviousRoot {
    topic: typeof PLURID_PUBSUB_TOPIC.PREVIOUS_ROOT;
    callback: PluridPubSubCallback<any>;
}

export interface PluridPubSubPublishMessageNextRoot {
    topic: typeof PLURID_PUBSUB_TOPIC.NEXT_ROOT;
    data?: any;
}
export interface PluridPubSubSubscribeMessageNextRoot {
    topic: typeof PLURID_PUBSUB_TOPIC.NEXT_ROOT;
    callback: PluridPubSubCallback<any>;
}

export type PluridPubSubMessageNavigateToRoot = {
    index: number;
} | {
    id: string;
}
export interface PluridPubSubPublishMessageNavigateToRoot {
    topic: typeof PLURID_PUBSUB_TOPIC.NAVIGATE_TO_ROOT;
    data: PluridPubSubMessageNavigateToRoot;
}
export interface PluridPubSubSubscribeMessageNavigateToRoot {
    topic: typeof PLURID_PUBSUB_TOPIC.NAVIGATE_TO_ROOT;
    callback: PluridPubSubCallback<PluridPubSubMessageNavigateToRoot>;
}


export type PluridPubSubMessageSetPlanePath = {
    planeID?: string;
    value: string;
}


export interface PluridPubSubPublishMessageAddPlaneLink {
    topic: typeof PLURID_PUBSUB_TOPIC.ADD_PLANE_LINK;
    data: PlaneLink;
}
export interface PluridPubSubSubscribeMessageAddPlaneLink {
    topic: typeof PLURID_PUBSUB_TOPIC.ADD_PLANE_LINK;
    callback: PluridPubSubCallback<PlaneLink>;
}

export interface PluridPubSubMessageRemovePlaneLink {
    id: string;
}
export interface PluridPubSubPublishMessageRemovePlaneLink {
    topic: typeof PLURID_PUBSUB_TOPIC.REMOVE_PLANE_LINK;
    data: PluridPubSubMessageRemovePlaneLink;
}
export interface PluridPubSubSubscribeMessageRemovePlaneLink {
    topic: typeof PLURID_PUBSUB_TOPIC.REMOVE_PLANE_LINK;
    callback: PluridPubSubCallback<PluridPubSubMessageRemovePlaneLink>;
}

export interface PluridPubSubMessageSetPlaneLinks {
    links: PlaneLink[];
}
export interface PluridPubSubPublishMessageSetPlaneLinks {
    topic: typeof PLURID_PUBSUB_TOPIC.SET_PLANE_LINKS;
    data: PluridPubSubMessageSetPlaneLinks;
}
export interface PluridPubSubSubscribeMessageSetPlaneLinks {
    topic: typeof PLURID_PUBSUB_TOPIC.SET_PLANE_LINKS;
    callback: PluridPubSubCallback<PluridPubSubMessageSetPlaneLinks>;
}


export interface PluridPubSubMessageSetSelection {
    /** The planes to select. `planeIDs` is the alias the other plane-addressing messages take. */
    ids?: string[];
    planeIDs?: string[];
}
export interface PluridPubSubPublishMessageSetSelection {
    topic: typeof PLURID_PUBSUB_TOPIC.SET_SELECTION;
    data: PluridPubSubMessageSetSelection;
}
export interface PluridPubSubSubscribeMessageSetSelection {
    topic: typeof PLURID_PUBSUB_TOPIC.SET_SELECTION;
    callback: PluridPubSubCallback<PluridPubSubMessageSetSelection>;
}

export interface PluridPubSubMessageToggleSelection {
    planeID?: string;
}
export interface PluridPubSubPublishMessageToggleSelection {
    topic: typeof PLURID_PUBSUB_TOPIC.TOGGLE_SELECTION;
    data: PluridPubSubMessageToggleSelection;
}
export interface PluridPubSubSubscribeMessageToggleSelection {
    topic: typeof PLURID_PUBSUB_TOPIC.TOGGLE_SELECTION;
    callback: PluridPubSubCallback<PluridPubSubMessageToggleSelection>;
}

export interface PluridPubSubPublishMessageClearSelection {
    topic: typeof PLURID_PUBSUB_TOPIC.CLEAR_SELECTION;
    data?: any;
}
export interface PluridPubSubSubscribeMessageClearSelection {
    topic: typeof PLURID_PUBSUB_TOPIC.CLEAR_SELECTION;
    callback: PluridPubSubCallback<any>;
}


/**
 * A state-based snapshot of the SHARED arrangement (structure + manual positions via `tree`, and the
 * link graph). The engine emits it on collaborative change; a peer applies it. (Op-based per-action
 * mutations are a future enhancement on top of this seam.)
 */
export interface PluridCollaborationSnapshot {
    tree?: TreePlane[];
    links?: PlaneLink[];
}
export interface PluridPubSubPublishMessageCollaborationMutation {
    topic: typeof PLURID_PUBSUB_TOPIC.COLLABORATION_MUTATION;
    data: PluridCollaborationSnapshot;
}
export interface PluridPubSubSubscribeMessageCollaborationMutation {
    topic: typeof PLURID_PUBSUB_TOPIC.COLLABORATION_MUTATION;
    callback: PluridPubSubCallback<PluridCollaborationSnapshot>;
}
export interface PluridPubSubPublishMessageApplyRemoteMutation {
    topic: typeof PLURID_PUBSUB_TOPIC.APPLY_REMOTE_MUTATION;
    data: PluridCollaborationSnapshot;
}
export interface PluridPubSubSubscribeMessageApplyRemoteMutation {
    topic: typeof PLURID_PUBSUB_TOPIC.APPLY_REMOTE_MUTATION;
    callback: PluridPubSubCallback<PluridCollaborationSnapshot>;
}


export interface PluridPubSubMessageSetViewpoint {
    /** An encoded viewpoint: the v1 `rotationX,rotationY,tX,tY,tZ,scale` tuple or a `v2|…` camera string. */
    viewpoint: string;
    /** Smoothly animate the camera to it (vs jump instantly). Default `false`. */
    animate?: boolean;
}
export interface PluridPubSubPublishMessageSetViewpoint {
    topic: typeof PLURID_PUBSUB_TOPIC.SET_VIEWPOINT;
    data: PluridPubSubMessageSetViewpoint;
}
export interface PluridPubSubSubscribeMessageSetViewpoint {
    topic: typeof PLURID_PUBSUB_TOPIC.SET_VIEWPOINT;
    callback: PluridPubSubCallback<PluridPubSubMessageSetViewpoint>;
}


export interface PluridPubSubMessageFitToView {
    /** tween (default) or jump */
    animate?: boolean;
    /** face the planes (default) or keep the current angles */
    faceOn?: boolean;
}
export interface PluridPubSubPublishMessageFitToView {
    topic: typeof PLURID_PUBSUB_TOPIC.FIT_TO_VIEW;
    data?: PluridPubSubMessageFitToView;
}
export interface PluridPubSubSubscribeMessageFitToView {
    topic: typeof PLURID_PUBSUB_TOPIC.FIT_TO_VIEW;
    callback: PluridPubSubCallback<PluridPubSubMessageFitToView | undefined>;
}
export interface PluridPubSubPublishMessageResetTransform {
    topic: typeof PLURID_PUBSUB_TOPIC.RESET_TRANSFORM;
    data?: any;
}
export interface PluridPubSubSubscribeMessageResetTransform {
    topic: typeof PLURID_PUBSUB_TOPIC.RESET_TRANSFORM;
    callback: PluridPubSubCallback<any>;
}
export interface PluridPubSubPublishMessageUndo {
    topic: typeof PLURID_PUBSUB_TOPIC.UNDO;
    data?: any;
}
export interface PluridPubSubSubscribeMessageUndo {
    topic: typeof PLURID_PUBSUB_TOPIC.UNDO;
    callback: PluridPubSubCallback<any>;
}
export interface PluridPubSubPublishMessageRedo {
    topic: typeof PLURID_PUBSUB_TOPIC.REDO;
    data?: any;
}
export interface PluridPubSubSubscribeMessageRedo {
    topic: typeof PLURID_PUBSUB_TOPIC.REDO;
    callback: PluridPubSubCallback<any>;
}

/** Jump through the arrangement history: `index` steps, negative into undo, positive into redo. */
export interface PluridPubSubMessageHistoryGoTo {
    index: number;
}
export interface PluridPubSubPublishMessageHistoryGoTo {
    topic: typeof PLURID_PUBSUB_TOPIC.HISTORY_GO_TO;
    data: PluridPubSubMessageHistoryGoTo;
}
export interface PluridPubSubSubscribeMessageHistoryGoTo {
    topic: typeof PLURID_PUBSUB_TOPIC.HISTORY_GO_TO;
    callback: PluridPubSubCallback<PluridPubSubMessageHistoryGoTo>;
}

export interface PluridPubSubMessageSetTree {
    tree: TreePlane[];
}
export interface PluridPubSubPublishMessageSetTree {
    topic: typeof PLURID_PUBSUB_TOPIC.SET_TREE;
    data: PluridPubSubMessageSetTree;
}
export interface PluridPubSubSubscribeMessageSetTree {
    topic: typeof PLURID_PUBSUB_TOPIC.SET_TREE;
    callback: PluridPubSubCallback<PluridPubSubMessageSetTree>;
}

export interface PluridPubSubMessageCameraDelta extends CameraDelta {
    /** Tween to the result instead of jumping. Default `false`. */
    animate?: boolean;
}
export interface PluridPubSubPublishMessageCameraDelta {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA;
    data: PluridPubSubMessageCameraDelta;
}
export interface PluridPubSubSubscribeMessageCameraDelta {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_CAMERA_DELTA;
    callback: PluridPubSubCallback<PluridPubSubMessageCameraDelta>;
}

export interface PluridPubSubMessageFrame {
    /** Frame this plane; omit (and `selection` false) to frame everything. */
    planeID?: string;
    /** Frame the current selection. */
    selection?: boolean;
    /** Frame THESE planes by their real corners, from `yaw`; over `planeID` and `selection`. */
    planeIDs?: string[];
    /**
     * The yaw to frame `planeIDs` or the selection from: a number, or `best` (the yaw at which the
     * narrowest of them reads widest, as a fit turns). `planeIDs` default to `best`; a selection
     * without it keeps the camera's yaw, as it always did.
     */
    yaw?: number | 'best';
    /** Tween to the framing instead of jumping. Default `true`. */
    animate?: boolean;
}
export interface PluridPubSubPublishMessageFrame {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_FRAME;
    data?: PluridPubSubMessageFrame;
}
export interface PluridPubSubSubscribeMessageFrame {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_FRAME;
    callback: PluridPubSubCallback<PluridPubSubMessageFrame | undefined>;
}

/** Dock the camera on a page (the page presentation): face-on, scale 1, the page filling the view. */
export interface PluridPubSubMessageDock {
    /** This plane; omit for the page nearest the view center. */
    planeID?: string;
    /** Tween instead of jumping. Default `true`. */
    animate?: boolean;
}
export interface PluridPubSubPublishMessageDock {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_DOCK;
    data?: PluridPubSubMessageDock;
}
export interface PluridPubSubSubscribeMessageDock {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_DOCK;
    callback: PluridPubSubCallback<PluridPubSubMessageDock | undefined>;
}

/** Reveal the space from a docked page: pull the camera back and tilt it (the page presentation). */
export interface PluridPubSubMessageReveal {
    /** Tween instead of jumping. Default `true`. */
    animate?: boolean;
}
export interface PluridPubSubPublishMessageReveal {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_REVEAL;
    data?: PluridPubSubMessageReveal;
}
export interface PluridPubSubSubscribeMessageReveal {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_REVEAL;
    callback: PluridPubSubCallback<PluridPubSubMessageReveal | undefined>;
}

export interface PluridPubSubMessageHome {
    /** Tween to the home viewpoint instead of jumping. Default `true`. */
    animate?: boolean;
}
export interface PluridPubSubPublishMessageHome {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_HOME;
    data?: PluridPubSubMessageHome;
}
export interface PluridPubSubSubscribeMessageHome {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_HOME;
    callback: PluridPubSubCallback<PluridPubSubMessageHome | undefined>;
}

export interface PluridPubSubMessageSetHome {
    /** The encoded viewpoint (v1 or v2) to make home; omit for the current camera. */
    viewpoint?: string;
}
export interface PluridPubSubPublishMessageSetHome {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SET_HOME;
    data?: PluridPubSubMessageSetHome;
}
export interface PluridPubSubSubscribeMessageSetHome {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SET_HOME;
    callback: PluridPubSubCallback<PluridPubSubMessageSetHome | undefined>;
}

export interface PluridPubSubMessagePreset {
    /** A key of `space.navigation.presets`. */
    name: string;
    /** Tween instead of jumping. Default `true`. */
    animate?: boolean;
}
export interface PluridPubSubPublishMessagePreset {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_PRESET;
    data: PluridPubSubMessagePreset;
}
export interface PluridPubSubSubscribeMessagePreset {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_PRESET;
    callback: PluridPubSubCallback<PluridPubSubMessagePreset>;
}

export type PluridBookmarkAction =
    | 'go'
    | 'save'
    | 'remove'
    | 'rename';
export interface PluridPubSubMessageBookmark {
    name: string;
    /**
     * `go` (default) moves the camera to the bookmark; `save` stores the current camera under the
     * name (an existing one is overwritten); `remove` deletes it; `rename` gives it the name `to`,
     * keeping its place in the list.
     */
    action?: PluridBookmarkAction;
    /** `rename`: the new name. */
    to?: string;
    /** Tween instead of jumping (`go`). Default `true`. */
    animate?: boolean;
}
export interface PluridPubSubPublishMessageBookmark {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK;
    data: PluridPubSubMessageBookmark;
}
export interface PluridPubSubSubscribeMessageBookmark {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_BOOKMARK;
    callback: PluridPubSubCallback<PluridPubSubMessageBookmark>;
}

export type PluridAlignEdge =
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'centerX'
    | 'centerY';
export interface PluridPubSubMessageAlign {
    edge: PluridAlignEdge;
}
export interface PluridPubSubPublishMessageAlign {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ALIGN;
    data: PluridPubSubMessageAlign;
}
export interface PluridPubSubSubscribeMessageAlign {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_ALIGN;
    callback: PluridPubSubCallback<PluridPubSubMessageAlign>;
}

export interface PluridPubSubMessageDistribute {
    axis: 'x' | 'y';
}
export interface PluridPubSubPublishMessageDistribute {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_DISTRIBUTE;
    data: PluridPubSubMessageDistribute;
}
export interface PluridPubSubSubscribeMessageDistribute {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_DISTRIBUTE;
    callback: PluridPubSubCallback<PluridPubSubMessageDistribute>;
}

export interface PluridPubSubMessageDuplicate {
    /** Space units the copies are offset by (x and y). Default `40`. */
    offset?: number;
}
export interface PluridPubSubPublishMessageDuplicate {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_DUPLICATE;
    data?: PluridPubSubMessageDuplicate;
}
export interface PluridPubSubSubscribeMessageDuplicate {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_DUPLICATE;
    callback: PluridPubSubCallback<PluridPubSubMessageDuplicate | undefined>;
}

/**
 * THE ARRANGEMENT FRAGMENT — what a copy puts on the clipboard and a paste reads back: the selected
 * planes with their subtrees and the links among them, as JSON text with a marker and a version. A
 * plane's identity in it is its ROUTE, so a paste into another application re-makes the planes it
 * registers and drops (with a warning) the routes it does not.
 */
export interface PluridPubSubMessageClipboard {
    /** `cut`: close the copied planes afterwards (the copy itself is the same). */
    cut?: boolean;
}
export interface PluridPubSubPublishMessageCopy {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_COPY;
    data?: PluridPubSubMessageClipboard;
}
export interface PluridPubSubSubscribeMessageCopy {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_COPY;
    callback: PluridPubSubCallback<PluridPubSubMessageClipboard | undefined>;
}
export interface PluridPubSubPublishMessageCut {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_CUT;
    data?: undefined;
}
export interface PluridPubSubSubscribeMessageCut {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_CUT;
    callback: PluridPubSubCallback<undefined>;
}

export interface PluridPubSubMessagePaste {
    /** The fragment's text. Without it, what this document last copied. */
    text?: string;
    /** A fragment the host already holds (its own transport) — no clipboard involved. */
    fragment?: unknown;
}
export interface PluridPubSubPublishMessagePaste {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_PASTE;
    data?: PluridPubSubMessagePaste;
}
export interface PluridPubSubSubscribeMessagePaste {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_PASTE;
    callback: PluridPubSubCallback<PluridPubSubMessagePaste | undefined>;
}

export interface PluridPubSubPublishMessageSelectAll {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SELECT_ALL;
    data?: undefined;
}
export interface PluridPubSubSubscribeMessageSelectAll {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SELECT_ALL;
    callback: PluridPubSubCallback<undefined>;
}
export interface PluridPubSubPublishMessageInvertSelection {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_INVERT_SELECTION;
    data?: undefined;
}
export interface PluridPubSubSubscribeMessageInvertSelection {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_INVERT_SELECTION;
    callback: PluridPubSubCallback<undefined>;
}


export type PluridChangeKind =
    | 'selection'
    | 'tree'
    | 'links'
    | 'activePlane'
    | 'isolate'
    | 'layoutResolved'
    | 'loading'
    | 'history'
    | 'motion'
    | 'bookmarks'
    /** the page presentation: the docked page's id, `''` when the camera left the page */
    | 'docked'
    /** the culling pass: `{ hidden, frozen, detached }` counts */
    | 'culling'
    /**
     * A PLANE THE HOST ASKED FOR, once it exists: `PluridPlaneObservation`.
     *
     * Published only for a `view.addPlane` / `space.spawnPlane` that carried a
     * `token`, so it is the answer to a question rather than a firehose.
     */
    | 'plane'
    /** the answer to `space.describe`: `PluridDescribeObservation` */
    | 'describe'
    /** what a `space.command` did: `PluridCommandObservation` */
    | 'command'
    /** whether the keyboard focus is inside the space */
    | 'focus';

/** What a `space.changed` of kind `describe` carries: the inspection `api.inspect()` gives, for a host without the api. */
export interface PluridDescribeObservation {
    token: string;
    inspection: unknown;
}

/** What a `space.changed` of kind `command` carries. */
export interface PluridCommandObservation {
    id: string;
    ran: boolean;
    /** why it did not run: no such command, disabled by the configuration (ignored by the bus), needs the key that matched it, or declined by its own guard */
    reason?: 'unknown' | 'disabled' | 'needsKey' | 'declined';
}
/**
 * What a `space.changed` of kind `plane` carries.
 *
 * `parameters` is the route's own, ALREADY PARSED — the engine parsed them to
 * build the plane and then dropped them, so every consumer re-derived them from
 * the id with a regex. They are the plane's identity in the HOST's vocabulary
 * (`/thread/:threadID` → `{ threadID }`), which is the thing a product actually
 * wants and the thing the engine alone can give without guessing.
 */
export interface PluridPlaneObservation {
    /** the token the host published with the command */
    token: string;
    /** the engine's runtime identity for this plane */
    planeID: string;
    /** the full route the plane resolved to */
    route: string;
    /** the route's parsed parameters (`routeDivisions.plane` over `.path`) */
    parameters: Record<string, string>;
    /** the parent, for a spawned child; `''` for a root */
    parentPlaneID: string;
}

export interface PluridPubSubMessageChanged {
    kind: PluridChangeKind;
    value: any;
}
export interface PluridPubSubPublishMessageChanged {
    topic: typeof PLURID_PUBSUB_TOPIC.CHANGED;
    data: PluridPubSubMessageChanged;
}
export interface PluridPubSubSubscribeMessageChanged {
    topic: typeof PLURID_PUBSUB_TOPIC.CHANGED;
    callback: PluridPubSubCallback<PluridPubSubMessageChanged>;
}



/**
 * TOTAL CONTROL (2026-09-13): the payloads for the topics that close the gap between the bus and
 * what the engine's own chrome, keyboard and imperative handle can reach.
 */

/** Any entry of `PLURID_SHORTCUTS`, by name. `arguments` is passed through to the binding. */
export interface PluridPubSubMessageCommand {
    /** A `PluridShortcutID` — `'copy'`, `'fitToView'`, `'togglePalette'`, … */
    id: string;
    /** Some bindings take one (reserved; ignored by the bindings that do not). */
    arguments?: Record<string, unknown>;
}
export interface PluridPubSubPublishMessageCommand {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_COMMAND;
    data: PluridPubSubMessageCommand;
}
export interface PluridPubSubSubscribeMessageCommand {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_COMMAND;
    callback: PluridPubSubCallback<PluridPubSubMessageCommand>;
}

/** Open `route` as a child of `parentPlaneID`, the way following a link does. */
export interface PluridPubSubMessageSpawnPlane {
    route: string;
    parentPlaneID: string;
    /**
     * Where on the parent the bridge leaves from, in the parent's px. Given, or measured from
     * `link`; else the parent's middle height (and `space.bridge.anchor` puts the x at the edge).
     */
    linkCoordinates?: { x: number; y: number };
    /** A CSS selector of the element inside the parent the bridge leaves from, measured as a `PluridLink` is; used when `linkCoordinates` is absent. */
    link?: string;
    /** A bridge length of the host's own, over the configured one and the sibling stagger. */
    bridgeLength?: number;
    /** How the bridge is drawn: a strip, or a leash (a thin line, for a later sibling whose strip would cross its elders). */
    bridgeKind?: 'strip' | 'leash';
    /** How the camera frames the opened plane: with its parent (`pair`), alone (`plane`), as configured (unset), or not at all (`none`). */
    framing?: 'pair' | 'plane' | 'none';
    /**
     * A CORRELATION TOKEN, so the host learns which plane this became.
     *
     * A plane's identity used to be reachable only through the DOM: publish a
     * route, guess a delay (`setTimeout(450)`), then
     * `querySelector('[data-plurid-plane*=…]')` — which returns the FIRST
     * match, so one route open twice addressed the wrong plane. Two separate
     * products wrote that same workaround, which is what a missing API looks
     * like.
     *
     * Pass any string here and the engine answers on `space.changed` with kind
     * `plane` once the plane is in the tree: `{ token, planeID, route,
     * parameters }`. No delay to guess, no DOM to query, and two planes of one
     * route are distinguishable. A spawn of a route already open OPENS it (never
     * puts it away), and a plane put away and shown again answers its token too.
     */
    token?: string;
}
export interface PluridPubSubPublishMessageSpawnPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SPAWN_PLANE;
    data: PluridPubSubMessageSpawnPlane;
}
export interface PluridPubSubSubscribeMessageSpawnPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SPAWN_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageSpawnPlane>;
}

export interface PluridPubSubMessageSetPlaneShow {
    planeID: string;
    show: boolean;
}
export interface PluridPubSubPublishMessageSetPlaneShow {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SET_PLANE_SHOW;
    data: PluridPubSubMessageSetPlaneShow;
}
export interface PluridPubSubSubscribeMessageSetPlaneShow {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SET_PLANE_SHOW;
    callback: PluridPubSubCallback<PluridPubSubMessageSetPlaneShow>;
}

/**
 * Move planes: the ones named, else the current selection. The SELECTION IS NOT TOUCHED (naming
 * planes used to select them, which clobbered whatever the reader had in hand), and a moved plane
 * is PINNED ONLY WHEN ASKED (`pinned: true`: the layout leaves it where it was put; the default
 * leaves it to the layout, as a product arranging its own space by `setTree` wants). One history
 * step per message.
 */
export interface PluridPubSubMessageMovePlanes {
    deltaX: number;
    deltaY: number;
    deltaZ?: number;
    /** Defaults to the selection. */
    planeIDs?: string[];
    /** `world` (the default): the deltas are world axes. `plane`: each plane's own axes, so `deltaX: 100` on a plane turned 90.1° moves it along world z. */
    frame?: 'world' | 'plane';
    /** Pin the moved planes where they land. Default `false`. */
    pinned?: boolean;
}
/** Ask the space to describe itself; answered on `space.changed` kind `describe`. */
export interface PluridPubSubMessageDescribe {
    token: string;
}
export interface PluridPubSubPublishMessageDescribe {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_DESCRIBE;
    data: PluridPubSubMessageDescribe;
}
export interface PluridPubSubSubscribeMessageDescribe {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_DESCRIBE;
    callback: PluridPubSubCallback<PluridPubSubMessageDescribe>;
}
export interface PluridPubSubPublishMessageBlur {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_BLUR;
    data?: Record<string, never>;
}
export interface PluridPubSubSubscribeMessageBlur {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_BLUR;
    callback: PluridPubSubCallback<Record<string, never> | undefined>;
}
export interface PluridPubSubMessagePinPlane {
    planeID: string;
    /** `true` (the default) pins the plane where it is; `false` lets the layout have it back. */
    pinned?: boolean;
}
export interface PluridPubSubPublishMessagePinPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_PIN_PLANE;
    data: PluridPubSubMessagePinPlane;
}
export interface PluridPubSubSubscribeMessagePinPlane {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_PIN_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessagePinPlane>;
}
export interface PluridPubSubPublishMessageMovePlanes {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_MOVE_PLANES;
    data: PluridPubSubMessageMovePlanes;
}
export interface PluridPubSubSubscribeMessageMovePlanes {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_MOVE_PLANES;
    callback: PluridPubSubCallback<PluridPubSubMessageMovePlanes>;
}

export interface PluridPubSubMessageResizePlane {
    planeID: string;
    width: number;
    height: number;
    /** `'manual'` pins the size against the layout; omit to leave the mode as it is. */
    sizeMode?: 'manual' | 'declared' | 'measured';
}
export interface PluridPubSubPublishMessageResizePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_RESIZE_PLANE;
    data: PluridPubSubMessageResizePlane;
}
export interface PluridPubSubSubscribeMessageResizePlane {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_RESIZE_PLANE;
    callback: PluridPubSubCallback<PluridPubSubMessageResizePlane>;
}

export interface PluridPubSubPublishMessageSnap {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SNAP;
    data?: {};
}
export interface PluridPubSubSubscribeMessageSnap {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SNAP;
    callback: PluridPubSubCallback<{}>;
}

/** The marquee, programmatically: every plane whose projection meets a screen rect. */
export interface PluridPubSubMessageSelectInRect {
    rect: { left: number; top: number; right: number; bottom: number };
    /** Replace the selection (default), add to it, or remove from it. */
    mode?: 'set' | 'add' | 'subtract';
}
export interface PluridPubSubPublishMessageSelectInRect {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SELECT_IN_RECT;
    data: PluridPubSubMessageSelectInRect;
}
export interface PluridPubSubSubscribeMessageSelectInRect {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SELECT_IN_RECT;
    callback: PluridPubSubCallback<PluridPubSubMessageSelectInRect>;
}

export interface PluridPubSubMessageNavigateDirection {
    direction: 'up' | 'down' | 'left' | 'right';
}
export interface PluridPubSubPublishMessageNavigateDirection {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_NAVIGATE_DIRECTION;
    data: PluridPubSubMessageNavigateDirection;
}
export interface PluridPubSubSubscribeMessageNavigateDirection {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_NAVIGATE_DIRECTION;
    callback: PluridPubSubCallback<PluridPubSubMessageNavigateDirection>;
}

/** `on` omitted toggles, as the key does. */
export interface PluridPubSubMessageToggleable {
    on?: boolean;
}
export interface PluridPubSubPublishMessageGrab {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_GRAB;
    data?: PluridPubSubMessageToggleable;
}
export interface PluridPubSubSubscribeMessageGrab {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_GRAB;
    callback: PluridPubSubCallback<PluridPubSubMessageToggleable>;
}
export interface PluridPubSubPublishMessagePalette {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_PALETTE;
    data?: PluridPubSubMessageToggleable;
}
export interface PluridPubSubSubscribeMessagePalette {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_PALETTE;
    callback: PluridPubSubCallback<PluridPubSubMessageToggleable>;
}
export interface PluridPubSubPublishMessageShortcutsOverlay {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SHORTCUTS_OVERLAY;
    data?: PluridPubSubMessageToggleable;
}
export interface PluridPubSubSubscribeMessageShortcutsOverlay {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_SHORTCUTS_OVERLAY;
    callback: PluridPubSubCallback<PluridPubSubMessageToggleable>;
}
export interface PluridPubSubPublishMessageFocus {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_FOCUS;
    data?: {};
}
export interface PluridPubSubSubscribeMessageFocus {
    topic: typeof PLURID_PUBSUB_TOPIC.SPACE_FOCUS;
    callback: PluridPubSubCallback<{}>;
}

/**
 * THE NICETIES: one step of what a key press gives a reader. `value` overrides the step (degrees for
 * a rotation, pixels for a translation, a scale amount for `scaleWith`).
 */
export interface PluridPubSubMessageCameraStep {
    value?: number;
}
export interface PluridPubSubPublishMessageCameraStep {
    topic:
        | typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_UP
        | typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_DOWN
        | typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_LEFT
        | typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_RIGHT
        | typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_UP
        | typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_DOWN
        | typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_LEFT
        | typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_RIGHT
        | typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_UP
        | typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_DOWN
        | typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_WITH;
    data?: PluridPubSubMessageCameraStep;
}
export interface PluridPubSubSubscribeMessageCameraStep {
    topic:
        | typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_UP
        | typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_DOWN
        | typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_LEFT
        | typeof PLURID_PUBSUB_TOPIC.SPACE_ROTATE_RIGHT
        | typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_UP
        | typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_DOWN
        | typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_LEFT
        | typeof PLURID_PUBSUB_TOPIC.SPACE_TRANSLATE_RIGHT
        | typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_UP
        | typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_DOWN
        | typeof PLURID_PUBSUB_TOPIC.SPACE_SCALE_WITH;
    callback: PluridPubSubCallback<PluridPubSubMessageCameraStep>;
}


export type PluridPubSubPublishMessage =
    | PluridPubSubPublishMessageConfiguration
    | PluridPubSubPublishMessageSpaceRotateXWith
    | PluridPubSubPublishMessageSpaceRotateYWith
    | PluridPubSubPublishMessageSpaceRotateXTo
    | PluridPubSubPublishMessageSpaceRotateYTo
    | PluridPubSubPublishMessageSpaceTranslateXWith
    | PluridPubSubPublishMessageSpaceTranslateYWith
    | PluridPubSubPublishMessageSpaceTranslateZWith
    | PluridPubSubPublishMessageSpaceTranslateXTo
    | PluridPubSubPublishMessageSpaceTranslateYTo
    | PluridPubSubPublishMessageSpaceTranslateZTo
    | PluridPubSubPublishMessageSpaceTransform
    | PluridPubSubPublishMessageViewAddPlane
    | PluridPubSubPublishMessageViewSetPlanes
    | PluridPubSubPublishMessageViewRemovePlane
    | PluridPubSubPublishMessageNavigateToPlane
    | PluridPubSubPublishMessageRefreshPlane
    | PluridPubSubPublishMessageIsolatePlane
    | PluridPubSubPublishMessageOpenClosedPlane
    | PluridPubSubPublishMessageClosePlane
    | PluridPubSubPublishMessagePreviousRoot
    | PluridPubSubPublishMessageNextRoot
    | PluridPubSubPublishMessageNavigateToRoot
    | PluridPubSubPublishMessageAddPlaneLink
    | PluridPubSubPublishMessageRemovePlaneLink
    | PluridPubSubPublishMessageSetPlaneLinks
    | PluridPubSubPublishMessageSetSelection
    | PluridPubSubPublishMessageToggleSelection
    | PluridPubSubPublishMessageClearSelection
    | PluridPubSubPublishMessageCollaborationMutation
    | PluridPubSubPublishMessageApplyRemoteMutation
    | PluridPubSubPublishMessageSetViewpoint
    | PluridPubSubPublishMessageFitToView
    | PluridPubSubPublishMessageResetTransform
    | PluridPubSubPublishMessageUndo
    | PluridPubSubPublishMessageRedo
    | PluridPubSubPublishMessageHistoryGoTo
    | PluridPubSubPublishMessageSetTree
    | PluridPubSubPublishMessageCameraDelta
    | PluridPubSubPublishMessageFrame
    | PluridPubSubPublishMessageDock
    | PluridPubSubPublishMessageReveal
    | PluridPubSubPublishMessageHome
    | PluridPubSubPublishMessageSetHome
    | PluridPubSubPublishMessagePreset
    | PluridPubSubPublishMessageBookmark
    | PluridPubSubPublishMessageAlign
    | PluridPubSubPublishMessageDistribute
    | PluridPubSubPublishMessageDuplicate
    | PluridPubSubPublishMessageCopy
    | PluridPubSubPublishMessageCut
    | PluridPubSubPublishMessagePaste
    | PluridPubSubPublishMessageSelectAll
    | PluridPubSubPublishMessageInvertSelection
    | PluridPubSubPublishMessageChanged
    | PluridPubSubPublishMessageCommand
    | PluridPubSubPublishMessageSpawnPlane
    | PluridPubSubPublishMessageSetPlaneShow
    | PluridPubSubPublishMessageMovePlanes
    | PluridPubSubPublishMessagePinPlane
    | PluridPubSubPublishMessageDescribe
    | PluridPubSubPublishMessageBlur
    | PluridPubSubPublishMessageResizePlane
    | PluridPubSubPublishMessageSnap
    | PluridPubSubPublishMessageSelectInRect
    | PluridPubSubPublishMessageNavigateDirection
    | PluridPubSubPublishMessageGrab
    | PluridPubSubPublishMessagePalette
    | PluridPubSubPublishMessageShortcutsOverlay
    | PluridPubSubPublishMessageFocus
    | PluridPubSubPublishMessageCameraStep
    ;


export type PluridPubSubSubscribeMessage =
    | PluridPubSubSubscribeMessageConfiguration
    | PluridPubSubSubscribeMessageSpaceRotateXWith
    | PluridPubSubSubscribeMessageSpaceRotateYWith
    | PluridPubSubSubscribeMessageSpaceRotateXTo
    | PluridPubSubSubscribeMessageSpaceRotateYTo
    | PluridPubSubSubscribeMessageSpaceTranslateXWith
    | PluridPubSubSubscribeMessageSpaceTranslateYWith
    | PluridPubSubSubscribeMessageSpaceTranslateZWith
    | PluridPubSubSubscribeMessageSpaceTranslateXTo
    | PluridPubSubSubscribeMessageSpaceTranslateYTo
    | PluridPubSubSubscribeMessageSpaceTranslateZTo
    | PluridPubSubSubscribeMessageSpaceTransform
    | PluridPubSubSubscribeMessageViewAddPlane
    | PluridPubSubSubscribeMessageViewSetPlanes
    | PluridPubSubSubscribeMessageViewRemovePlane
    | PluridPubSubSubscribeMessageNavigateToPlane
    | PluridPubSubSubscribeMessageRefreshPlane
    | PluridPubSubSubscribeMessageIsolatePlane
    | PluridPubSubSubscribeMessageOpenClosedPlane
    | PluridPubSubSubscribeMessageClosePlane
    | PluridPubSubSubscribeMessagePreviousRoot
    | PluridPubSubSubscribeMessageNextRoot
    | PluridPubSubSubscribeMessageNavigateToRoot
    | PluridPubSubSubscribeMessageAddPlaneLink
    | PluridPubSubSubscribeMessageRemovePlaneLink
    | PluridPubSubSubscribeMessageSetPlaneLinks
    | PluridPubSubSubscribeMessageSetSelection
    | PluridPubSubSubscribeMessageToggleSelection
    | PluridPubSubSubscribeMessageClearSelection
    | PluridPubSubSubscribeMessageCollaborationMutation
    | PluridPubSubSubscribeMessageApplyRemoteMutation
    | PluridPubSubSubscribeMessageSetViewpoint
    | PluridPubSubSubscribeMessageFitToView
    | PluridPubSubSubscribeMessageResetTransform
    | PluridPubSubSubscribeMessageUndo
    | PluridPubSubSubscribeMessageRedo
    | PluridPubSubSubscribeMessageHistoryGoTo
    | PluridPubSubSubscribeMessageSetTree
    | PluridPubSubSubscribeMessageCameraDelta
    | PluridPubSubSubscribeMessageFrame
    | PluridPubSubSubscribeMessageDock
    | PluridPubSubSubscribeMessageReveal
    | PluridPubSubSubscribeMessageHome
    | PluridPubSubSubscribeMessageSetHome
    | PluridPubSubSubscribeMessagePreset
    | PluridPubSubSubscribeMessageBookmark
    | PluridPubSubSubscribeMessageAlign
    | PluridPubSubSubscribeMessageDistribute
    | PluridPubSubSubscribeMessageDuplicate
    | PluridPubSubSubscribeMessageCopy
    | PluridPubSubSubscribeMessageCut
    | PluridPubSubSubscribeMessagePaste
    | PluridPubSubSubscribeMessageSelectAll
    | PluridPubSubSubscribeMessageInvertSelection
    | PluridPubSubSubscribeMessageChanged
    | PluridPubSubSubscribeMessageCommand
    | PluridPubSubSubscribeMessageSpawnPlane
    | PluridPubSubSubscribeMessageSetPlaneShow
    | PluridPubSubSubscribeMessageMovePlanes
    | PluridPubSubSubscribeMessagePinPlane
    | PluridPubSubSubscribeMessageDescribe
    | PluridPubSubSubscribeMessageBlur
    | PluridPubSubSubscribeMessageResizePlane
    | PluridPubSubSubscribeMessageSnap
    | PluridPubSubSubscribeMessageSelectInRect
    | PluridPubSubSubscribeMessageNavigateDirection
    | PluridPubSubSubscribeMessageGrab
    | PluridPubSubSubscribeMessagePalette
    | PluridPubSubSubscribeMessageShortcutsOverlay
    | PluridPubSubSubscribeMessageFocus
    | PluridPubSubSubscribeMessageCameraStep
    ;
// #endregion module
