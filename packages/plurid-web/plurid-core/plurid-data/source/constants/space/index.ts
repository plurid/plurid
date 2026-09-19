// #region module
export const ROTATION_STEP = 3;

export const TRANSLATION_STEP = 25;

export const SCALE_STEP = 0.05;
export const SCALE_LOWER_LIMIT = 0.1;
export const SCALE_UPPER_LIMIT = 4;


export const ROOTS_GAP = 50;

export const PLANE_DEFAULT_ANGLE = 90;

export const FOCUS_ANCHOR_SUFFIX = '-focus';

/** The height of a plane's controls bar, px: its first row in the space presentation, hanging above the sheet on a page. */
export const PLANE_BAR_HEIGHT = 56;
/** The height of the bridge strip between a link and its spawned plane, px (the leash is drawn as this band). */
export const BRIDGE_STRIP_HEIGHT = 30;
/**
 * A BRIDGE IS A LINE, px. It was a 30px band, then a band tapering to a thread, and both were
 * objects: a plate across the space, then a wedge that read as an arrowhead pointing at the plane
 * (the reader, 2026-09-19). A connector says one thing - this plane came from that point - and the
 * quietest thing that says it is a hairline of one width, the crosslink beam's own.
 */
export const BRIDGE_THREAD = 3;
/**
 * What a bridge is worth while nothing is happening: present, not competing with the prose. The
 * line is drawn in INK, which is near-white on a dark space, so these are far lower than the
 * numbers the old dark BAND carried (0.55 resting, 0.75 moving): the same fractions of a light
 * line read as a cable across the picture.
 */
export const BRIDGE_OPACITY_REST = 0.14;
/** And while the camera moves or its plane is under the pointer, when it is the thing to follow. */
export const BRIDGE_OPACITY_LIVE = 0.45;
/** Up to this tilt a bridge points EXACTLY at its link, degrees. */
export const BRIDGE_LEAN_KNEE = 12;
/** The tilt a bridge leans toward and never reaches, however far the link scrolls, degrees. */
export const BRIDGE_LEAN_LIMIT = 22;
// #endregion module
