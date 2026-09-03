// #region module
export interface Vec2 {
    x: number;
    y: number;
}

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}


/**
 * The camera — the engine's canonical description of where the viewer is.
 *
 * The rendered matrix is `T(C + offset) · Rx(pitch) · Ry(yaw) · S(scale) · T(-pivot)`, where `C`
 * is the view center. So:
 *  - `pivot` is the world point that orbit and zoom rotate/scale about;
 *  - `offset` is where that pivot sits in camera space, relative to the view center: `x`/`y` are
 *    the screen-space pan, `z` is the dolly (positive = the pivot is closer to the eye);
 *  - `yaw`/`pitch` are the turntable angles (degrees), `scale` the uniform zoom.
 *
 * Pan is applied AFTER rotation (it is a camera-space translation), so it is screen-exact at any
 * orientation; orbit leaves the pivot fixed on screen; re-pivoting is a lossless re-parameterization.
 * The legacy six scalars (`rotationX/Y`, `translationX/Y/Z`, `scale`) are an exact alternative
 * parameterization with the pivot implicitly at the view center — see `interaction.camera.legacy`.
 */
export interface CameraState {
    /** Turntable rotation about world Y, degrees, wrapped to (-180, 180]. */
    yaw: number;
    /** Rotation about the camera X axis, degrees, clamped to ±`CameraLimits.pitchLimit`. */
    pitch: number;
    /** Uniform zoom factor, clamped to [`zoomMin`, `zoomMax`]. */
    scale: number;
    /** World-space point that orbit and zoom act about. */
    pivot: Vec3;
    /** Camera-space position of the pivot relative to the view center: (pan.x, pan.y, dolly). */
    offset: Vec3;
    /** CSS perspective distance, px (the eye sits this far in front of the view plane). */
    perspective: number;
}


export interface CameraLimits {
    /** Maximum |pitch| in degrees. Default `89` (the top view is never degenerate). */
    pitchLimit: number;
    /** Minimum `scale`. Default `0.1`. */
    zoomMin: number;
    /** Maximum `scale`. Default `4`. */
    zoomMax: number;
    /** The pivot may dolly no closer to the eye than this fraction of `perspective`. Default `0.6`. */
    dollyLimitFraction: number;
}


/**
 * One camera mutation. Fields are applied in this order: `pivot` (re-parameterize, lossless),
 * `look` (rotate about the eye), `yaw`/`pitch` (orbit about the pivot), `pan`, `dolly`, `fly`,
 * `zoom`, then `absolute` (direct field writes, applied last). Every field is optional so an input
 * layer can batch several inputs into one delta per frame.
 */
export interface CameraDelta {
    /** Set the orbit pivot to this world point without moving the picture. */
    pivot?: Vec3;
    /** Orbit about the pivot, degrees. */
    yaw?: number;
    pitch?: number;
    /** Rotate about the eye instead of the pivot (first-person look), degrees. */
    look?: {
        yaw: number;
        pitch: number;
    };
    /** Screen-space pan in px; the content on the pivot-depth plane follows the pointer exactly. */
    pan?: Vec2;
    /** Dolly in px along the camera axis (positive = closer). */
    dolly?: number;
    /**
     * Camera-relative movement in px: `forward` along the view axis (respects pitch), `strafe` to the
     * right, `vertical` up.
     */
    fly?: {
        forward?: number;
        strafe?: number;
        vertical?: number;
    };
    /** Multiplicative zoom about `anchor` (view px; defaults to the view center). */
    zoom?: {
        factor: number;
        anchor?: Vec2;
    };
    /** Direct writes, applied last (still clamped/wrapped). */
    absolute?: Partial<Pick<CameraState, 'yaw' | 'pitch' | 'scale' | 'pivot' | 'offset' | 'perspective'>>;
}


export type CameraMotion =
    | 'idle'
    | 'gesture'
    | 'fling'
    | 'tween';
// #endregion module
