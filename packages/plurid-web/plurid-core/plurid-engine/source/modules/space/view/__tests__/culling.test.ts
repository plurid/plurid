// #region imports
    // #region external
    import {
        identityCamera,
        applyCameraDelta,
    } from '../../../interaction/camera';

    import {
        cullPlanes,
        sameCulling,
        CullingPlane,
        EMPTY_CULLING,
    } from '../culling';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1000, height: 600 };

const plane = (
    id: string,
    x: number,
    y = 0,
    z = 0,
): CullingPlane => ({
    id,
    width: 200,
    height: 150,
    location: {
        translateX: x,
        translateY: y,
        translateZ: z,
        rotateX: 0,
        rotateY: 0,
    },
});


describe('cullPlanes()', () => {
    it('hides planes fully outside the frustum margin and behind the eye, keeps the rest', () => {
        const camera = identityCamera(view);
        const planes = [
            plane('in', 400, 200),
            plane('farRight', 2000, 200),
            plane('edge', 1100, 200),
            plane('behind', 400, 200, 2500),
        ];
        const result = cullPlanes(planes, camera, view, { frustumMargin: 0.25 });
        expect(result.hidden).toEqual(['farRight', 'behind']);
        expect(result.frozen).toEqual([]);
        expect(result.depths.in).toBeCloseTo(camera.perspective, 6);
    });

    it('hides by distance and freezes beyond the freeze distance, exceptions win', () => {
        let camera = identityCamera(view);
        camera = applyCameraDelta(camera, { zoom: { factor: 0.2 } }, view);
        // zoomed out ×0.2: depths (from the eye) near 2000, far 2800, farther 3800
        const planes = [plane('near', 400, 200, 0), plane('far', 400, 200, -4000), plane('farther', 400, 200, -9000)];
        const result = cullPlanes(planes, camera, view, { distance: 3500, freezeDistance: 2500, hysteresis: 0 });
        expect(result.hidden).toEqual(['farther']);
        expect(result.frozen).toEqual(['far']);
        const spared = cullPlanes(planes, camera, view, { distance: 3500, freezeDistance: 2500, hysteresis: 0 }, EMPTY_CULLING, new Set(['farther', 'far']));
        expect(spared.hidden).toEqual([]);
        expect(spared.frozen).toEqual([]);
    });

    it('hysteresis: a plane jittering on the distance boundary never flickers', () => {
        const camera = identityCamera(view);
        let previous = EMPTY_CULLING;
        const states: boolean[] = [];
        for (let frame = 0; frame < 20; frame += 1) {
            // depth oscillates ±60 around the 1500 threshold (z negative = farther from the eye)
            const z = -(1500 - camera.perspective) - (frame % 2 === 0 ? 60 : -60);
            const result = cullPlanes([plane('p', 400, 200, z)], camera, view, { distance: 1500, hysteresis: 0.15 }, previous);
            states.push(result.hidden.includes('p'));
            previous = result;
        }
        expect(new Set(states).size).toBe(1);
    });

    it('sameCulling compares the lists', () => {
        expect(sameCulling({ hidden: ['a'], frozen: [], depths: {} }, { hidden: ['a'], frozen: [], depths: { a: 1 } })).toBe(true);
        expect(sameCulling({ hidden: ['a'], frozen: [], depths: {} }, { hidden: ['b'], frozen: [], depths: {} })).toBe(false);
    });
});
// #endregion module
