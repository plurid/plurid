// #region imports
    // #region libraries
    import {
        LinkCoordinates,
        PluridConfigurationSpaceBridgeLean,

        BRIDGE_LEAN_KNEE,
        BRIDGE_LEAN_LIMIT,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * THE LEASH. A child plane is placed exactly one bridge length from its link's ANCHOR (the link's
 * position when it was measured, stored on the tree). When the link scrolls inside its plane the
 * child does not move — its world position is state — but the bridge follows: it becomes the
 * segment from the child's edge to the link's CURRENT point, tilting and stretching, resting at the
 * fold once the link is beyond it (the measurement clamps there). The two values ride on the child
 * plane element as CSS custom properties (no store churn), and the bridge's stylesheet draws the
 * segment from them as a band across an axis-aligned box - never as a rotated element, whose corners
 * would cross the parent's plane (components/structural/Plane/components/PlaneBridge/styled.ts).
 */
export const BRIDGE_REACH_VARIABLE = '--plurid-bridge-reach';
export const BRIDGE_ANGLE_VARIABLE = '--plurid-bridge-angle';

export interface BridgeGeometry {
    /** the bridge's length, px */
    reach: number;
    /** its tilt about the child-side end, degrees (clockwise-positive, y down: a rising leash is positive for `start`) */
    angle: number;
}


/**
 * THE LEAN. A bridge points at its link, and a link scrolled far down a tall plane used to drag it
 * into a 500px band tilted 78 degrees: a grey diagonal across the space, cutting through every
 * plane it passed (the reader's screenshots, 2026-09-18). A bridge LEANS toward the link instead.
 *
 * Exactly the tilt up to `knee`, then eased toward `limit` and never reaching it. The easing is
 * continuous at the knee and has slope 1 there, so there is no step and no corner where it takes
 * over, and it never stops answering: every further scroll still moves the bridge, less and less.
 */
export const leanAngle = (
    tilt: number,
    lean?: PluridConfigurationSpaceBridgeLean,
): number => {
    const knee = typeof lean?.knee === 'number' && lean.knee >= 0 ? lean.knee : BRIDGE_LEAN_KNEE;
    // a limit at or under the knee is the knee: the bridge points exactly at the link up to there
    // and leans no further, which is what a product asking for a limit that low means
    const limit = typeof lean?.limit === 'number' && lean.limit >= 0
        ? Math.max(lean.limit, knee)
        : Math.max(knee, BRIDGE_LEAN_LIMIT);
    const magnitude = Math.abs(tilt);
    if (magnitude <= knee) {
        return tilt;
    }
    const span = limit - knee;
    if (span <= 0) {
        return Math.sign(tilt) * knee;
    }
    const eased = limit - span * Math.exp(-(magnitude - knee) / span);
    return Math.sign(tilt) * eased;
};

/**
 * Only the VERTICAL displacement is followed: a scroll moves the link along its plane's Y, which is
 * the child's local Y (unrotated), so the leash stays in the child's plane. A horizontal
 * displacement would leave that plane; the anchor clamps it and the bridge ignores it.
 */
export const bridgeGeometry = (
    anchor: LinkCoordinates | undefined,
    current: LinkCoordinates | undefined,
    bridgeLength: number,
    bridgeSide: 'start' | 'end' = 'start',
    lean?: PluridConfigurationSpaceBridgeLean,
): BridgeGeometry => {
    const length = bridgeLength > 0 ? bridgeLength : 0;
    if (!anchor || !current || length === 0) {
        return { reach: length, angle: 0 };
    }
    const dy = current.y - anchor.y;
    if (dy === 0) {
        return { reach: length, angle: 0 };
    }
    // the far end leans toward (-L, dy) in the child's frame for `start` (the strip points along
    // -X from its child-side corner), toward (+L, dy) for `end`
    const tilt = leanAngle(Math.atan2(dy, length) * 180 / Math.PI, lean);
    // AND LANDS ON THE PARENT'S FACE, which is one bridge length along the child's own axis: the
    // bridge keeps its length whatever the lean (`L / cos`, which below the knee IS the old
    // `hypot(L, dy)`, so a small scroll is untouched), and never stretches across the space.
    const reach = length / Math.cos(tilt * Math.PI / 180);
    const angle = bridgeSide === 'end' ? tilt : -tilt;
    return {
        reach: Math.round(reach * 100) / 100,
        angle: Math.round(angle * 100) / 100,
    };
};
// #endregion module
