// #region module
export const PLURID_PUBSUB_TOPIC = {
    CONFIGURATION: 'configuration',

    SPACE_ROTATE_X_WITH: 'space.rotateXWith',
    SPACE_ROTATE_Y_WITH: 'space.rotateYWith',

    SPACE_ROTATE_X_TO: 'space.rotateXTo',
    SPACE_ROTATE_Y_TO: 'space.rotateYTo',

    SPACE_TRANSLATE_X_WITH: 'space.translateXWith',
    SPACE_TRANSLATE_Y_WITH: 'space.translateYWith',
    SPACE_TRANSLATE_Z_WITH: 'space.translateZWith',

    SPACE_TRANSLATE_X_TO: 'space.translateXTo',
    SPACE_TRANSLATE_Y_TO: 'space.translateYTo',
    SPACE_TRANSLATE_Z_TO: 'space.translateZTo',

    SPACE_TRANSFORM: 'space.transform',

    VIEW_ADD_PLANE: 'view.addPlane',
    VIEW_SET_PLANES: 'view.setPlanes',
    VIEW_REMOVE_PLANE: 'view.removePlane',

    NAVIGATE_TO_PLANE: 'space.navigateToPlane',
    REFRESH_PLANE: 'space.refreshPlane',
    ISOLATE_PLANE: 'space.isolatePlane',
    OPEN_CLOSED_PLANE: 'space.openClosedPlane',
    CLOSE_PLANE: 'space.closePlane',
    PREVIOUS_ROOT: 'space.previousRoot',
    NEXT_ROOT: 'space.nextRoot',
    NAVIGATE_TO_ROOT: 'space.navigateToRoot',

    ADD_PLANE_LINK: 'space.addPlaneLink',
    REMOVE_PLANE_LINK: 'space.removePlaneLink',
    SET_PLANE_LINKS: 'space.setPlaneLinks',

    SET_SELECTION: 'space.setSelection',
    TOGGLE_SELECTION: 'space.toggleSelection',
    CLEAR_SELECTION: 'space.clearSelection',

    // Collaboration seam (transport-agnostic). The engine PUBLISHES `collaborationMutation` when the
    // shared arrangement changes; a host forwards it over its transport and republishes incoming peer
    // changes as `applyRemoteMutation`.
    COLLABORATION_MUTATION: 'space.collaborationMutation',
    APPLY_REMOTE_MUTATION: 'space.applyRemoteMutation',

    /** Programmatic camera control: a host publishes an encoded viewpoint to move/jump the camera. */
    SET_VIEWPOINT: 'space.setViewpoint',

    // High-value declarative control (the niche operations are reachable via the `onReady` api). All
    // no-data unless noted.
    FIT_TO_VIEW: 'space.fitToView',
    RESET_TRANSFORM: 'space.resetTransform',
    UNDO: 'space.undo',
    REDO: 'space.redo',
    /** Jump to a step of the history: data `{ index }` — negative into undo (`-1` = one undo), positive into redo. */
    HISTORY_GO_TO: 'space.historyGoTo',
    SET_TREE: 'space.setTree',          // data: { tree }

    /**
     * One camera mutation (`CameraDelta`: pivot / orbit / look / pan / dolly / fly / zoom /
     * absolute), optionally animated. The single control topic every camera input reduces to.
     */
    SPACE_CAMERA_DELTA: 'space.cameraDelta',
    /** Frame a plane (`planeID`), the selection, or everything (no target), optionally animated. */
    SPACE_FRAME: 'space.frame',
    SPACE_DOCK: 'space.dock',
    SPACE_REVEAL: 'space.reveal',
    /** Go to the home viewpoint (`space.setHome` / `navigation.home` / identity). data?: { animate? } */
    SPACE_HOME: 'space.home',
    /** Set the home viewpoint: data `{ viewpoint }` (encoded), or no data for the current camera. */
    SPACE_SET_HOME: 'space.setHome',
    /** Go to a named preset viewpoint (`navigation.presets`). data: { name, animate? } */
    SPACE_PRESET: 'space.preset',
    /** Bookmarks: data `{ name, action?: 'go' | 'save' | 'remove', animate? }` (default `go`). */
    SPACE_BOOKMARK: 'space.bookmark',

    // Selection editing (Phase 5): all act on `selectedPlaneIDs`.
    /** Line the selection up on an edge: data `{ edge: 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY' }`. */
    SPACE_ALIGN: 'space.align',
    /** Equal gaps between the selected planes along an axis: data `{ axis: 'x' | 'y' }` (3+ planes). */
    SPACE_DISTRIBUTE: 'space.distribute',
    /** Duplicate the selected root planes (offset copies, selected afterwards): data? `{ offset }`. */
    SPACE_DUPLICATE: 'space.duplicate',
    SPACE_COPY: 'space.copy',
    SPACE_CUT: 'space.cut',
    SPACE_PASTE: 'space.paste',
    /** Select every shown plane. */
    SPACE_SELECT_ALL: 'space.selectAll',
    /** Invert the selection over the shown planes. */
    SPACE_INVERT_SELECTION: 'space.invertSelection',

    /**
     * The single engine→host OBSERVE channel: published as `{ kind, value }` whenever a watched slice
     * changes (`selection`/`tree`/`links`/`activePlane`/`isolate`/`layoutResolved`/`loading`). One
     * subscription covers all of them — finer than diffing snapshots, lighter than N topics.
     */
    CHANGED: 'space.changed',

    /**
     * TOTAL CONTROL (2026-09-13). Everything a reader can do, a host can do: these close the last
     * gaps between the bus and what the engine's own chrome, keyboard and imperative handle reach.
     *
     * `SPACE_COMMAND` is the general one — it runs any entry of `PLURID_SHORTCUTS` BY NAME, through
     * the same `runShortcut` the command palette uses, so every command the engine grows is reachable
     * from the bus the day it is added, without waiting for a topic of its own.
     */
    SPACE_COMMAND: 'space.command',

    /** Open a plane as a child of another, the way following a link does. */
    SPACE_SPAWN_PLANE: 'space.spawnPlane',
    /** Show or hide one plane (hiding records it as the last closed). */
    SPACE_SET_PLANE_SHOW: 'space.setPlaneShow',
    /** Move planes: the ones named, or the selection; in world axes or the plane's own; pinned only when asked. */
    SPACE_MOVE_PLANES: 'space.movePlanes',
    /** Pin a plane where it is (`manuallyPositioned`), or let the layout have it back. */
    SPACE_PIN_PLANE: 'space.pinPlane',
    /** Ask the space to describe itself: answered on `space.changed` kind `describe` with the inspection. */
    SPACE_DESCRIBE: 'space.describe',
    /** Take the keyboard focus off the space (the inverse of `space.focus`). */
    SPACE_BLUR: 'space.blur',
    /** Resize one plane (`sizeMode: 'manual'` pins it against the layout). */
    SPACE_RESIZE_PLANE: 'space.resizePlane',
    /** Snap the selection to the grid / guides now. */
    SPACE_SNAP: 'space.snap',
    /** Select every plane whose projection meets a screen rect (the marquee, programmatically). */
    SPACE_SELECT_IN_RECT: 'space.selectInRect',
    /** Move the active plane to the nearest one in a screen direction, and frame it. */
    SPACE_NAVIGATE_DIRECTION: 'space.navigateDirection',
    /** Arm or disarm grab mode (what `G` toggles). */
    SPACE_GRAB: 'space.grab',
    /** Show or hide the command palette. */
    SPACE_PALETTE: 'space.palette',
    /** Show or hide the shortcuts overlay. */
    SPACE_SHORTCUTS_OVERLAY: 'space.shortcutsOverlay',
    /** Move keyboard focus to the space, so the shortcuts apply. */
    SPACE_FOCUS: 'space.focus',

    /**
     * THE NICETIES (restored, and IMPLEMENTED, 2026-09-13). One step of the thing a reader gets from
     * a key press — the ergonomic layer over `SPACE_CAMERA_DELTA`, which is the primitive and wants a
     * vector. These existed as typed, documented topics with NO subscriber, so publishing one did
     * nothing; the reducer actions behind them (`rotateUp`, `translateLeft`, `scaleUp` …) were there
     * the whole time and were simply never wired. `value` overrides the step where it makes sense.
     */
    SPACE_ROTATE_UP: 'space.rotateUp',
    SPACE_ROTATE_DOWN: 'space.rotateDown',
    SPACE_ROTATE_LEFT: 'space.rotateLeft',
    SPACE_ROTATE_RIGHT: 'space.rotateRight',
    SPACE_TRANSLATE_UP: 'space.translateUp',
    SPACE_TRANSLATE_DOWN: 'space.translateDown',
    SPACE_TRANSLATE_LEFT: 'space.translateLeft',
    SPACE_TRANSLATE_RIGHT: 'space.translateRight',
    SPACE_SCALE_UP: 'space.scaleUp',
    SPACE_SCALE_DOWN: 'space.scaleDown',
    SPACE_SCALE_WITH: 'space.scaleWith',
} as const;


/**
 * The topics the ENGINE publishes (the host listens): a publish of one of these with no subscriber
 * is not a dropped command, so the bus never warns about it. Every other topic is a command TO the
 * engine, dropped with a development warning when nothing is mounted to take it.
 */
export const PLURID_PUBSUB_EMITTED_TOPICS: readonly string[] = [
    PLURID_PUBSUB_TOPIC.CHANGED,
    PLURID_PUBSUB_TOPIC.COLLABORATION_MUTATION,
];


export type PluridPubSubTopic = typeof PLURID_PUBSUB_TOPIC;
export type PluridPubSubTopicKeys = keyof typeof PLURID_PUBSUB_TOPIC;
export type PluridPubSubTopicKeysType = typeof PLURID_PUBSUB_TOPIC[PluridPubSubTopicKeys];
// #endregion module


/**
 * EVERY KIND A `space.changed` CAN CARRY, with what its `value` is. A runtime list so the docs
 * table (`docs/CHANGES.md`) is generated from it and cannot drift from the type
 * (`PluridChangeKind`, which a test holds equal to this list).
 */
export const PLURID_CHANGE_KINDS = [
    ['selection', 'the selected plane ids, `string[]`'],
    ['tree', 'the whole tree of planes, roots with their children (`TreePlane[]`)'],
    ['links', 'the plane links (`PluridPlaneLink[]`)'],
    ['activePlane', 'the active plane id, `\'\'` for none'],
    ['isolate', 'the isolated plane id, `\'\'` for none'],
    ['layoutResolved', 'the layout the roots were arranged by'],
    ['loading', 'whether planes are still loading'],
    ['history', 'the arrangement history: `{ canUndo, canRedo, undoDepth, redoDepth, past, future }`'],
    ['motion', 'the camera\'s motion state: `idle`, `tween`, `gesture`, `fling`'],
    ['bookmarks', 'the named viewpoints'],
    ['docked', 'the page presentation: the docked page id, `\'\'` when the camera left the page'],
    ['culling', 'the culling pass: `{ hidden, frozen, detached }` counts'],
    ['plane', 'the answer to a `token`: `{ token, planeID, route, parameters, parentPlaneID }`'],
    ['describe', 'the answer to `space.describe`: `{ token, inspection }`, the inspection as `api.inspect()` gives it'],
    ['command', 'what a `space.command` did: `{ id, ran, reason }` (`unknown`, `disabled`, `needsKey`, `declined`)'],
    ['focus', 'whether the keyboard focus is inside the space, `boolean`'],
] as const;
