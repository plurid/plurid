// #region imports
    // #region external
    import {
        createCamera,
        cameraMatrix,
        interpolateCamera,
        shortestArc,
        estimateVelocity,
        decayVelocity,
        springStep,
        springSettled,
        EASINGS,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
const view = { width: 1000, height: 600 };


describe('camera motion math', () => {
    it('shortestArc() takes the short way round', () => {
        expect(shortestArc(170, -170)).toBe(20);
        expect(shortestArc(-170, 170)).toBe(-20);
        expect(shortestArc(10, 350)).toBe(-20);
        expect(shortestArc(0, 180)).toBe(180);
    });

    it('interpolateCamera() hits both endpoints and interpolates scale geometrically', () => {
        const from = createCamera(2000, { yaw: 170, scale: 1, pivot: { x: 0, y: 0, z: 0 } });
        const to = createCamera(2000, { yaw: -170, scale: 4, pivot: { x: 500, y: 100, z: 0 }, offset: { x: 20, y: 0, z: 0 } });
        expect(interpolateCamera(from, to, 0, view)).toBe(from);
        expect(interpolateCamera(from, to, 1, view)).toBe(to);
        const middle = interpolateCamera(from, to, 0.5, view);
        expect(middle.yaw).toBeCloseTo(180, 9);
        expect(middle.scale).toBeCloseTo(2, 9);
        expect(middle.pivot).toEqual(to.pivot);
    });

    it('interpolateCamera() at t≈0 renders the start picture despite the re-pivot', () => {
        const from = createCamera(2000, { yaw: 30, pitch: -10, scale: 1.5, pivot: { x: 100, y: 200, z: 0 }, offset: { x: 40, y: -10, z: 50 } });
        const to = createCamera(2000, { yaw: -60, pitch: 20, scale: 0.5, pivot: { x: -300, y: 50, z: 100 } });
        const start = cameraMatrix(from, view);
        const almost = cameraMatrix(interpolateCamera(from, to, 1e-9, view), view);
        start.forEach((value, index) => {
            expect(almost[index]).toBeCloseTo(value, 5);
        });
    });

    it('easings start at 0 and end at 1', () => {
        for (const easing of Object.values(EASINGS)) {
            expect(easing(0)).toBeCloseTo(0, 9);
            expect(easing(1)).toBeCloseTo(1, 9);
        }
    });

    it('estimateVelocity() is independent of the sample rate', () => {
        const trajectory = (hz: number) => {
            const samples = [];
            const step = 1000 / hz;
            for (let time = 0; time <= 200; time += step) {
                samples.push({ x: time * 0.5, y: -time * 0.25, time });
            }
            return samples;
        };
        const fast = estimateVelocity(trajectory(1000), 200);
        const slow = estimateVelocity(trajectory(20), 200);
        expect(fast.x).toBeCloseTo(0.5, 6);
        expect(slow.x).toBeCloseTo(0.5, 6);
        expect(fast.y).toBeCloseTo(-0.25, 6);
        expect(slow.y).toBeCloseTo(-0.25, 6);
    });

    it('estimateVelocity() is zero after a pause and with too few samples', () => {
        const samples = [
            { x: 0, y: 0, time: 0 },
            { x: 50, y: 0, time: 50 },
        ];
        expect(estimateVelocity(samples, 130)).toEqual({ x: 0, y: 0 });
        expect(estimateVelocity(samples, 60).x).toBeCloseTo(1, 9);
        expect(estimateVelocity([samples[0]], 0)).toEqual({ x: 0, y: 0 });
    });

    it('decayVelocity() is frame-rate independent over one second', () => {
        let coarse = 10;
        let fine = 10;
        for (let i = 0; i < 60; i += 1) {
            coarse = decayVelocity(coarse, 0.92, 1000 / 60);
        }
        for (let i = 0; i < 240; i += 1) {
            fine = decayVelocity(fine, 0.92, 1000 / 240);
        }
        expect(fine).toBeCloseTo(coarse, 6);
        expect(coarse).toBeCloseTo(10 * Math.pow(0.92, 60), 6);
    });

    it('springStep() settles on the target', () => {
        let state = { position: 0, velocity: 0 };
        for (let i = 0; i < 300; i += 1) {
            state = springStep(state, 100, 1000 / 60);
        }
        expect(springSettled(state, 100)).toBe(true);
    });
});
// #endregion module
