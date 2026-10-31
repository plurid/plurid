// #region imports
    // #region external
    import type {
        Vec3,
        CameraState,
    } from '~interfaces/internal/camera';

    import type {
        PluridMotionEasing,
    } from '~interfaces/external/configuration';
    // #endregion external
// #endregion imports



// #region module
// #region anchors
/**
 * A CAMERA POSE IN A PLANE'S OWN FRAME (2026-10-30). The camera (`CameraState`) with its rotation
 * and its pivot taken into the frame of one plane, so the picture of that plane is the same
 * wherever the plane moves or turns: a relayout, a re-measured link, a reopened session. A world
 * camera (a viewpoint, a bookmark) stays where it was while its plane moves away; this one moves
 * with the plane.
 *
 * `yaw` / `pitch` / `roll` are the camera's angles relative to the plane (`0, 0, 0` reads it
 * face-on), `scale` the camera's zoom, `pivot` the point the camera turns about in px on the plane
 * (from its top-left corner: `x` along its width, `y` down its height, `z` along its normal) and
 * `offset` where that point sits in camera space relative to the view centre (`x` / `y` the pan,
 * `z` the dolly). A recorded pose pivots on the point under the view centre, so its offset pans by
 * nothing: `{ x: 0, y: 0, z }`.
 *
 * A pose is ABSOLUTE in the plane's frame: its scale and its pivot's px stay what they were when a
 * plane is resized, so it shows the same point of the content at the same zoom, and does not adapt
 * to the new size the way `dock` and `frame` do.
 */
export interface PluridAnchorPose {
    yaw: number;
    pitch: number;
    /** The horizon's tilt, degrees. Default `0`. */
    roll?: number;
    scale: number;
    pivot: Vec3;
    /** Default `{ x: 0, y: 0, z: 0 }`. */
    offset?: Vec3;
}

/**
 * The poses an anchor names instead of spelling: `dock` reads the plane as a page (face-on at its
 * fill scale), `frame` frames it whole as the frame control does (a dock in the page
 * presentation). Both are computed from the plane's geometry when the anchor resolves, so they
 * follow a resize as well as a move.
 */
export type PluridAnchorPoseMode =
    | 'dock'
    | 'frame';

/**
 * WHERE A CAMERA STANDS, NAMED BY A PLANE (2026-10-30): the plane's path, which plane at that
 * path, and the pose relative to it. A plane id is a runtime identity (a spawned plane's `@digest`
 * changes with the link that opened it); the path is the identity a plane keeps across sessions,
 * the one an arrangement fragment is addressed by.
 */
export interface PluridPlaneAnchor {
    /**
     * The plane's path with the query that is part of its identity (`/files/report?page=2`), as
     * a link asks for it. A full plane address (`plurid://host/files/report`) reads as its path.
     */
    path: string;
    /**
     * Which plane at that path, when several are open: counting from 0 in tree order, depth first
     * (a root, then every plane that hangs from it, then the next root), closed planes included, so
     * an anchor names one plane however many are shown. A closed one answers `hidden`, even when a
     * later plane at the path is shown: the anchor names that plane, not the first shown one.
     * Default `0`.
     */
    occurrence?: number;
    /** Default `frame`. */
    pose?: PluridAnchorPose | PluridAnchorPoseMode;
}

/** Why an anchor cannot be reached now: no plane at its path, or the plane (or a plane it hangs from) is hidden. */
export type PluridAnchorMissing =
    | 'absent'
    | 'hidden';

/** Where an anchor resolves to in the space as it is now: the plane and the camera, or why not. */
export type PluridAnchorResolution =
    | {
        ok: true;
        planeID: string;
        camera: CameraState;
        /**
         * The plane is pinned to the screen (2026-10-31): it is in view wherever the camera is, so
         * the camera stays (`camera` is the camera now) and nothing moves.
         */
        pinned?: true;
    }
    | {
        ok: false;
        reason: PluridAnchorMissing;
        /** the plane at the path, when there is one (`hidden`) */
        planeID?: string;
    };
// #endregion anchors


// #region tour
/** The format marker of a tour document. */
export type PluridTourFormat = 'plurid/tour';

/**
 * A STOP OF A TOUR: an anchored camera and how long the reader stays there. The engine reads the
 * anchor and the timings; `payload` is the host's own (a caption, a file, a finding) and is
 * carried, never read.
 */
export interface PluridTourStep<P = unknown> {
    /** Unique in its tour: `seek` and the events name the step by it. */
    id: string;
    anchor: PluridPlaneAnchor;
    /** The travel to the stop, ms. Default `navigation.motion.duration`. */
    duration?: number;
    easing?: PluridMotionEasing;
    /**
     * How long the camera stays at the stop before the next step, ms; `null` stays until `next()`.
     * Default the tour's `dwell`.
     */
    dwell?: number | null;
    payload?: P;
}

/** A tour: steps through anchored stops, as a document a host saves and plays again. */
export interface PluridTour<P = unknown> {
    plurid: PluridTourFormat;
    version: 1;
    id?: string;
    title?: string;
    /** The dwell of a step that names none. Default `null`: every stop waits for `next()`. */
    dwell?: number | null;
    steps: PluridTourStep<P>[];
}

/**
 * Where the player is: `preparing` a step (the space booting, the host's `onStep`, a retry, a plane
 * closed under the step), `travelling` to it, `dwelling` at it, `paused` (the reader's input on the
 * view; another move taking the camera, during a travel or at a stop; the host), `ended`; `idle`
 * before the first tour. A paused tour prepares nothing: a step it skips to waits for resume
 * before its `onStep` runs.
 */
export type PluridTourStatus =
    | 'idle'
    | 'preparing'
    | 'travelling'
    | 'dwelling'
    | 'paused'
    | 'ended';

/** `input`: the reader pressed, scrolled or typed on the view; `interrupted`: another camera move took the camera; `host`: `pause()`. */
export type PluridTourPauseReason =
    | 'input'
    | 'interrupted'
    | 'host';

/** `complete`: past the last step; `stopped`: `stop()`, an `onStep` / `onMissing` that said `stop`, or the application left; `replaced`: another tour started; `error`: the tour is not one, or the host's callback threw. */
export type PluridTourEndReason =
    | 'complete'
    | 'stopped'
    | 'replaced'
    | 'error';

/** A step passed over: its plane is missing (`absent`, `hidden`), or the host's `onStep` said `skip`. */
export type PluridTourSkipReason =
    | PluridAnchorMissing
    | 'host';

export interface PluridTourState {
    status: PluridTourStatus;
    /** The tour's `id`, `''` for none. */
    tourID: string;
    /** The step in hand, `-1` before the first. */
    index: number;
    /** Its id, `''` before the first. */
    stepID: string;
    /** How many steps the tour has. */
    count: number;
    /** The plane the step resolved to, `''` until it resolves. */
    planeID: string;
    /** Why the tour is paused (`status: 'paused'`). */
    paused?: PluridTourPauseReason;
    /** Why the tour ended (`status: 'ended'`). */
    ended?: PluridTourEndReason;
}

/** What the player did, in order: what a host's caption bar, a log or a model listens to. */
export type PluridTourEvent<P = unknown> =
    | {
        type: 'travel';
        index: number;
        step: PluridTourStep<P>;
        planeID: string;
    }
    | {
        type: 'arrive';
        index: number;
        step: PluridTourStep<P>;
        planeID: string;
    }
    | {
        type: 'skip';
        index: number;
        step: PluridTourStep<P>;
        reason: PluridTourSkipReason;
    }
    | {
        type: 'pause';
        index: number;
        reason: PluridTourPauseReason;
    }
    | {
        type: 'resume';
        index: number;
    }
    | {
        type: 'end';
        index: number;
        reason: PluridTourEndReason;
        /** what was wrong (`reason: 'error'`) */
        error?: string;
    };

/** What `play` resolves with: the end event. */
export type PluridTourEnd = Extract<PluridTourEvent, { type: 'end' }>;

/** What the host's `onStep` is told: the step's place, and a signal aborted when the tour moves on before the step travels. */
export interface PluridTourStepContext {
    index: number;
    signal: AbortSignal;
}

export interface PluridTourMissingContext extends PluridTourStepContext {
    reason: PluridAnchorMissing;
    /** `1` the first time the step is found missing, `2` after one retry, … */
    attempt: number;
}

/** `skip` passes the step; `stop` ends the tour. Nothing: the step travels. */
export type PluridTourStepAction =
    | 'skip'
    | 'stop';

/** `skip` (the default) passes the step; `retry` resolves it again once the space is at rest; `stop` ends the tour. */
export type PluridTourMissingAction =
    | 'skip'
    | 'retry'
    | 'stop';

export interface PluridTourPlayOptions<P = unknown> {
    /** The step to start at, by index or id. Default the first. */
    start?: number | string;
    /**
     * Asked as each step begins, before it resolves or travels, and awaited: open what the stop
     * shows (a plane, a file), set the caption. The anchor resolves against the space this leaves.
     */
    onStep?: (step: PluridTourStep<P>, context: PluridTourStepContext) => PluridTourStepAction | void | Promise<PluridTourStepAction | void>;
    /** Asked when a step's plane is absent or hidden, and awaited. Without it the step is skipped. */
    onMissing?: (step: PluridTourStep<P>, context: PluridTourMissingContext) => PluridTourMissingAction | Promise<PluridTourMissingAction>;
    /**
     * A press, a wheel or a key on the view (an editable field and a lone modifier aside) pauses the
     * tour. Default `true`. With `false` the reader can read, click, scroll and press keys at a stop
     * while the tour goes on; whatever stops or takes the camera (a drag, a zoom, a key during a
     * travel, which the engine stops a tween for, a host's or an agent's move) still pauses it, as
     * `interrupted`: the camera is someone else's then.
     */
    pauseOnInput?: boolean;
}

export interface PluridTourRecordOptions {
    /** Told of each stop as it is captured, with every stop so far. */
    onCapture?: (step: PluridTourStep, steps: PluridTourStep[]) => void;
    /** The dwell of every captured stop. Default none: the tour's. */
    dwell?: number | null;
}

/**
 * A RECORDER: a stop each time the camera comes to rest somewhere new (a gesture, a wheel, a key,
 * a host's move), anchored on the plane it looks at; a rest where the last stop already is adds
 * nothing.
 */
export interface PluridTourRecorder {
    /** The stops so far. */
    steps: () => PluridTourStep[];
    /** Capture where the camera is now (the first stop, a hand-placed one): `undefined` when it looks at no plane, or repeats the last stop. */
    capture: () => PluridTourStep | undefined;
    /** Stop listening, and the tour of the stops. */
    stop: () => PluridTour;
}

/** The tour controls of an application (`handle.tour`). */
export interface PluridTourControls {
    /**
     * Play a tour, from its first step or `start`; a tour already playing ends (`replaced`). Resolves
     * with the end. A tour that is not one (or a `start` it lacks) resolves at once with
     * `{ reason: 'error', index: -1, error }` and leaves the tour playing alone; a play started from
     * a listener of the `replaced` end is the newer one and plays, and this one resolves `replaced`.
     */
    play: <P = unknown>(tour: PluridTour<P>, options?: PluridTourPlayOptions<P>) => Promise<PluridTourEnd>;
    pause: () => void;
    /** Go on from where the tour paused: the step resolves again, so it lands where its plane is now. */
    resume: () => void;
    next: () => void;
    previous: () => void;
    /** Go to a step, by index or id. */
    seek: (step: number | string) => void;
    stop: () => void;
    state: () => PluridTourState;
    /** Every event, with the state after it. Returns the unsubscribe. */
    subscribe: (listener: (event: PluridTourEvent, state: PluridTourState) => void) => () => void;
    record: (options?: PluridTourRecordOptions) => PluridTourRecorder;
}

/** What a `space.changed` of kind `tour` carries: the player's state, and the event that changed it (none for a `state` query). */
export interface PluridTourObservation {
    state: PluridTourState;
    event?: PluridTourEvent;
    /** A `play` refused: what is wrong with the tour. The tour playing (`state`) goes on. */
    error?: string;
}
// #endregion tour
// #endregion module
