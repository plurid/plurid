// #region imports
    // #region libraries
    import {
        LinkCoordinates,
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
 * plane element as CSS custom properties (no store churn), and the bridge's stylesheet reads them.
 */
export const BRIDGE_REACH_VARIABLE = '--plurid-bridge-reach';
export const BRIDGE_ANGLE_VARIABLE = '--plurid-bridge-angle';

export interface BridgeGeometry {
    /** the bridge's length, px */
    reach: number;
    /** its tilt about the child-side end, degrees (CSS `rotate`: clockwise-positive, y down) */
    angle: number;
}

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
): BridgeGeometry => {
    const length = bridgeLength > 0 ? bridgeLength : 0;
    if (!anchor || !current || length === 0) {
        return { reach: length, angle: 0 };
    }
    const dy = current.y - anchor.y;
    if (dy === 0) {
        return { reach: length, angle: 0 };
    }
    const reach = Math.hypot(length, dy);
    // the far end must land at (-L, dy) in the child's frame for `start` (the strip points along
    // -X from its child-side corner), at (+L, dy) for `end`
    const tilt = Math.atan2(dy, length) * 180 / Math.PI;
    const angle = bridgeSide === 'end' ? tilt : -tilt;
    return {
        reach: Math.round(reach * 100) / 100,
        angle: Math.round(angle * 100) / 100,
    };
};
// #endregion module
