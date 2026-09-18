// #region imports
    // #region external
    import {
        bridgeGeometry,
        leanAngle,
    } from '../bridge';
    // #endregion external
// #endregion imports



// #region module
describe('bridgeGeometry()', () => {
    const anchor = { x: 880, y: 86 };

    it('rests at the bridge length while the link sits at its anchor (or nothing is known)', () => {
        expect(bridgeGeometry(anchor, anchor, 160)).toEqual({ reach: 160, angle: 0 });
        expect(bridgeGeometry(undefined, anchor, 160)).toEqual({ reach: 160, angle: 0 });
        expect(bridgeGeometry(anchor, undefined, 160, 'end')).toEqual({ reach: 160, angle: 0 });
        expect(bridgeGeometry(anchor, { x: 880, y: 86 }, 0)).toEqual({ reach: 0, angle: 0 });
    });

    it('stretches to the link\'s current point and tilts about the child-side corner', () => {
        // the link rose 32 px (scrolled toward the fold): the far end lands at (-160, -32)
        const up = bridgeGeometry(anchor, { x: 880, y: 54 }, 160);
        expect(up.reach).toBeCloseTo(Math.hypot(160, 32), 2);
        expect(up.angle).toBeCloseTo(11.31, 2);
        // the link dropped 32 px: the mirror image
        const down = bridgeGeometry(anchor, { x: 880, y: 118 }, 160);
        expect(down.reach).toBeCloseTo(Math.hypot(160, 32), 2);
        expect(down.angle).toBeCloseTo(-11.31, 2);
        // a mirrored bridge (`end`) tilts the other way
        expect(bridgeGeometry(anchor, { x: 880, y: 54 }, 160, 'end').angle).toBeCloseTo(-11.31, 2);
    });

    it('a zero or negative bridge length is no bridge: nothing to stretch, nothing to tilt', () => {
        expect(bridgeGeometry({ x: 0, y: 0 }, { x: 0, y: -40 }, 0)).toEqual({ reach: 0, angle: 0 });
        expect(bridgeGeometry({ x: 0, y: 0 }, { x: 0, y: -40 }, -160)).toEqual({ reach: 0, angle: 0 });
    });

    it('ignores a horizontal displacement (it would leave the child\'s plane)', () => {
        expect(bridgeGeometry(anchor, { x: 0, y: 86 }, 160)).toEqual({ reach: 160, angle: 0 });
    });

    /**
     * THE LEAN. A link scrolled 500px down its parent used to drag a 100px bridge into a 509px
     * band at 78 degrees: a grey diagonal across the space, cutting every plane it passed. The
     * bridge leans toward the link now and lands on the parent's face, so it stays a bridge long.
     */
    it('leans toward a far-scrolled link instead of stretching to it', () => {
        const far = bridgeGeometry({ x: 880, y: 86 }, { x: 880, y: 586 }, 100);
        expect(Math.abs(far.angle)).toBeLessThan(22);
        expect(Math.abs(far.angle)).toBeGreaterThan(21);
        // the far end lands ON the parent's face: a bridge length over the cosine of the lean
        expect(far.reach).toBeCloseTo(100 / Math.cos(Math.abs(far.angle) * Math.PI / 180), 1);
        expect(far.reach).toBeLessThan(110);
    });

    it('never passes the limit, however far the link scrolls, and keeps answering', () => {
        const angles = [200, 1_000, 10_000, 1_000_000].map(
            (dy) => Math.abs(bridgeGeometry(anchor, { x: 880, y: 86 + dy }, 100).angle),
        );
        for (const angle of angles) {
            expect(angle).toBeLessThanOrEqual(22);
        }
        // a further scroll still moves it, by less
        expect(angles[1]).toBeGreaterThan(angles[0] - 0.001);
        expect(angles[1] - angles[0]).toBeLessThan(1);
    });

    it('takes the knee and the limit the product sets', () => {
        const tight = bridgeGeometry(anchor, { x: 880, y: 586 }, 100, 'start', { knee: 2, limit: 6 });
        expect(Math.abs(tight.angle)).toBeLessThanOrEqual(6);
        expect(tight.reach).toBeLessThan(101);
    });
});


describe('leanAngle()', () => {
    it('is the tilt itself up to the knee, on both sides', () => {
        expect(leanAngle(0)).toBe(0);
        expect(leanAngle(7.5)).toBe(7.5);
        expect(leanAngle(-11.9)).toBe(-11.9);
        expect(leanAngle(12)).toBe(12);
    });

    /** no step and no corner where the easing takes over: a scroll must not jump */
    it('is continuous at the knee and smooth through it', () => {
        expect(leanAngle(12.0001)).toBeCloseTo(12, 3);
        const below = leanAngle(11.9) - leanAngle(11.8);
        const above = leanAngle(12.2) - leanAngle(12.1);
        expect(Math.abs(above - below)).toBeLessThan(0.01);
    });

    it('rises toward the limit and never passes it', () => {
        expect(leanAngle(40)).toBeLessThan(22);
        expect(leanAngle(40)).toBeGreaterThan(leanAngle(30));
        expect(leanAngle(1_000)).toBeLessThanOrEqual(22);
    });

    it('a limit at or under the knee is the knee, not a negative span', () => {
        expect(leanAngle(90, { knee: 10, limit: 10 })).toBe(10);
        expect(leanAngle(-90, { knee: 10, limit: 4 })).toBe(-10);
    });
});
// #endregion module
