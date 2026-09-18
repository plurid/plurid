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
 * How far a bridge keeps its full strip height off the plane's edge, px, before it tapers. A
 * bridge is a band where it leaves the plane and a thread where it arrives: at the resting length
 * the taper is barely there, and a long one (a scrolled link, a fan's later sibling) reads as a
 * line instead of a plate.
 */
export const BRIDGE_BAND_RUN = 60;
/** The height a bridge tapers to at its far end, px. */
export const BRIDGE_TIP_HEIGHT = 4;
/** Up to this tilt a bridge points EXACTLY at its link, degrees. */
export const BRIDGE_LEAN_KNEE = 12;
/** The tilt a bridge leans toward and never reaches, however far the link scrolls, degrees. */
export const BRIDGE_LEAN_LIMIT = 22;
// #endregion module
