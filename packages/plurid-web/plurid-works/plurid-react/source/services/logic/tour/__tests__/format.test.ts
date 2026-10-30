// #region imports
    // #region internal
    import {
        parseTour,
        serializeTour,
        PLURID_TOUR_FORMAT,
        PLURID_TOUR_MAX_STEPS,
        PLURID_TOUR_MAX_DWELL,
    } from '../format';
    // #endregion internal
// #endregion imports



// #region module
const tour = {
    plurid: PLURID_TOUR_FORMAT,
    version: 1,
    id: 'job',
    title: 'The job',
    dwell: 4000,
    steps: [
        { id: 'request', anchor: { path: '/request' }, payload: { caption: 'The request' } },
        { id: 'drawing', anchor: { path: '/drawing', occurrence: 1, pose: 'dock' }, duration: 600, easing: 'in-out-cubic', dwell: null },
        { id: 'holes', anchor: { path: '/part.dxf', pose: { yaw: 12, pitch: -8, scale: 1.4, pivot: { x: 220, y: 140 } } }, dwell: 2500 },
    ],
};

const errorOf = (
    value: unknown,
): string => {
    const parsed = parseTour(value);
    return parsed.ok ? '' : parsed.error;
};


describe('the tour format', () => {
    it('reads a tour from text or a value, keeping what the format holds and the payload as given', () => {
        const fromText = parseTour(JSON.stringify(tour));
        const fromValue = parseTour(tour);
        expect(fromText).toEqual(fromValue);
        expect(fromValue.ok).toBe(true);
        if (!fromValue.ok) {
            return;
        }
        expect(fromValue.tour.steps.map((step) => step.id)).toEqual(['request', 'drawing', 'holes']);
        expect(fromValue.tour.steps[0].payload).toBe(tour.steps[0].payload);
        expect(fromValue.tour.steps[1].dwell).toBeNull();
        // a hand-written pose may leave the plane's surface implicit
        expect(fromValue.tour.steps[2].anchor.pose).toEqual({ yaw: 12, pitch: -8, scale: 1.4, pivot: { x: 220, y: 140, z: 0 } });
        // an unknown field does not travel
        expect(parseTour({ ...tour, extra: 1 } as any)).toEqual(fromValue);
    });

    it('writes it back as legible JSON that reads the same', () => {
        const parsed = parseTour(tour);
        if (!parsed.ok) {
            throw new Error(parsed.error);
        }
        const text = serializeTour(parsed.tour);
        expect(text).toContain('\n    "steps": [');
        expect(parseTour(text)).toEqual(parsed);
    });

    it('names what is wrong, and where, never throwing', () => {
        expect(errorOf('{ nope')).toMatch(/^not JSON/);
        expect(errorOf(null)).toMatch(/must be an object/);
        expect(errorOf({ ...tour, plurid: 'plurid/fragment' })).toMatch(/is not one/);
        expect(errorOf({ ...tour, version: 2 })).toMatch(/version 2; this build reads version 1/);
        expect(errorOf({ ...tour, steps: 'all' })).toMatch(/steps. must be an array/);
        expect(errorOf({ ...tour, steps: [{ anchor: { path: '/a' } }] })).toBe('step 1.id: must be a non-empty string');
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '' } }] })).toBe('step 1 (\'a\').anchor.path: must be the plane\'s path, a non-empty string');
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a' } }, { id: 'a', anchor: { path: '/b' } }] })).toMatch(/^step 2 \('a'\)\.id: is the id of an earlier step/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a', occurrence: -1 } }] })).toMatch(/occurrence: must be a whole number/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a', pose: 'orbit' } }] })).toMatch(/pose: must be 'dock', 'frame'/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a', pose: { yaw: 0, pitch: 0, scale: 0, pivot: { x: 0, y: 0 } } } }] })).toMatch(/scale must be a number above 0/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a', pose: { yaw: 0, pitch: 0, roll: 'tilted', scale: 1, pivot: { x: 0, y: 0 } } } }] })).toMatch(/roll must be a finite number/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a', pose: { yaw: 0, pitch: Number.NaN, scale: 1, pivot: { x: 0, y: 0 } } } }] })).toMatch(/yaw and pitch must be finite/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a', pose: { yaw: 0, pitch: 0, scale: 1, pivot: { x: 0 } } } }] })).toMatch(/pivot: must hold finite numbers/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a', pose: { yaw: 0, pitch: 0, scale: 1, pivot: 'centre' } } }] })).toMatch(/pivot: must be \{ x, y, z \}/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a', pose: { yaw: 0, pitch: 0, scale: 1, pivot: { x: 0, y: 0 }, offset: { x: 0, y: 0 } } } }] })).toMatch(/offset: must hold finite numbers/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: '/a' }] })).toMatch(/anchor: must be \{ path/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a' }, dwell: -5 }] })).toMatch(/dwell: must be a number of ms from 0, or null/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a' }, duration: 'slow' }] })).toMatch(/duration: must be a number of ms/);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a' }, easing: 'bounce' }] })).toMatch(/easing: must be one of linear/);
        expect(errorOf({ ...tour, steps: [7] })).toMatch(/^step 1: must be/);
        expect(errorOf({ ...tour, dwell: 'long' })).toMatch(/tour\.dwell: must be a number/);
        expect(errorOf({ ...tour, id: 3 })).toMatch(/tour\.id: must be a string/);
        expect(errorOf({ ...tour, title: false })).toMatch(/tour\.title: must be a string/);
    });

    it('holds at most PLURID_TOUR_MAX_STEPS steps, and a dwell no longer than a timer keeps', () => {
        const steps = (count: number) => Array.from({ length: count }, (_, at) => ({ id: 's' + at, anchor: { path: '/a' } }));
        expect(parseTour({ ...tour, steps: steps(PLURID_TOUR_MAX_STEPS) }).ok).toBe(true);
        expect(errorOf({ ...tour, steps: steps(PLURID_TOUR_MAX_STEPS + 1) })).toBe(`the tour: has ${PLURID_TOUR_MAX_STEPS + 1} steps; a tour holds at most ${PLURID_TOUR_MAX_STEPS}`);
        expect(parseTour({ ...tour, steps: [{ id: 'a', anchor: { path: '/a' }, dwell: PLURID_TOUR_MAX_DWELL }] }).ok).toBe(true);
        expect(errorOf({ ...tour, steps: [{ id: 'a', anchor: { path: '/a' }, dwell: PLURID_TOUR_MAX_DWELL + 1 }] })).toMatch(/dwell: must be at most 2147483647 ms/);
        expect(errorOf({ ...tour, dwell: 3e9 })).toMatch(/tour\.dwell: must be at most/);
    });

    it('takes an empty tour: a recorder that captured nothing gives one', () => {
        expect(parseTour({ plurid: PLURID_TOUR_FORMAT, version: 1, steps: [] })).toEqual({
            ok: true,
            tour: { plurid: PLURID_TOUR_FORMAT, version: 1, steps: [] },
        });
    });
});
// #endregion module
