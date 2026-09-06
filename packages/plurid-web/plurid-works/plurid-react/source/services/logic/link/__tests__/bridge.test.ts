// #region imports
    // #region external
    import {
        bridgeGeometry,
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

    it('ignores a horizontal displacement (it would leave the child\'s plane)', () => {
        expect(bridgeGeometry(anchor, { x: 0, y: 86 }, 160)).toEqual({ reach: 160, angle: 0 });
    });
});
// #endregion module
