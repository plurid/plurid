// #region imports
    // #region libraries
    import {
        /** constants */
        defaultTreePlane,

        /** interfaces */
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import computeFaceToFaceLayout from '../faceToFace';
    // #endregion external
// #endregion imports



// #region module
/**
 * `computeFaceToFaceLayout` arranges roots into rows of `2 + middle` columns where the first + last
 * plane of each row tilt toward each other (a "face to face" pair) — first at `+planeAngle`, last at
 * `-planeAngle`, `planeAngle = 90 - angle/2`, with the first plane pushed back in Z to open the wedge.
 *
 * These are POSITIONAL INVARIANTS rather than a frozen deep-equal of the whole tree (the previous test
 * asserted an old column layout — note the stale `computeColumnLayout` name — and broke when the real
 * arc landed). They pin the geometry that defines "face to face" while tolerating tuning.
 */
const makePlane = (sourceID: string, route: string): TreePlane => ({
    ...defaultTreePlane,
    sourceID,
    route,
    planeID: '',
    show: true,
    location: { rotateX: 0, rotateY: 0, translateX: 0, translateY: 0, translateZ: 0 },
});


describe('computeFaceToFaceLayout', () => {
    // jsdom: pin a deterministic viewport (the layout scales unit plane widths by window.innerWidth).
    Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

    const DEFAULT_ANGLE = 45;
    const planeAngle = 90 - DEFAULT_ANGLE / 2; // 67.5

    it('tilts a pair of planes to face each other', () => {
        const result = computeFaceToFaceLayout([
            makePlane('1', '/page-1'),
            makePlane('2', '/page-2'),
        ]);

        // structure + order preserved
        expect(result).toHaveLength(2);
        expect(result.map((p) => p.route)).toEqual(['/page-1', '/page-2']);

        // the defining invariant: opposed tilt — first +angle, last -angle
        expect(result[0].location.rotateY).toBeCloseTo(planeAngle);
        expect(result[1].location.rotateY).toBeCloseTo(-planeAngle);

        // the first plane is pushed back in Z to open the wedge; the last sits at the front
        expect(result[0].location.translateZ).toBeGreaterThan(0);
        expect(result[1].location.translateZ).toBe(0);

        // laid out left→right, on the same row
        expect(result[1].location.translateX).toBeGreaterThan(result[0].location.translateX);
        expect(result[0].location.translateY).toBe(result[1].location.translateY);
    });

    it('splits into facing rows of two (5 planes → [2, 2, 1])', () => {
        const result = computeFaceToFaceLayout(
            ['1', '2', '3', '4', '5'].map((id) => makePlane(id, `/page-${id}`)),
        );

        expect(result).toHaveLength(5);

        const y = result.map((p) => p.location.translateY);
        // rows of two stack downward; pairs share a row, the lone 5th drops to its own row
        expect(y[0]).toBe(y[1]);
        expect(y[2]).toBe(y[3]);
        expect(y[2]).toBeGreaterThan(y[0]);
        expect(y[4]).toBeGreaterThan(y[2]);

        // each full row faces inward: first +angle, last -angle
        expect(result[0].location.rotateY).toBeCloseTo(planeAngle);
        expect(result[1].location.rotateY).toBeCloseTo(-planeAngle);
        expect(result[2].location.rotateY).toBeCloseTo(planeAngle);
        expect(result[3].location.rotateY).toBeCloseTo(-planeAngle);
        // a lone plane in the final partial row is the row's first → +angle
        expect(result[4].location.rotateY).toBeCloseTo(planeAngle);
    });
});
// #endregion module
