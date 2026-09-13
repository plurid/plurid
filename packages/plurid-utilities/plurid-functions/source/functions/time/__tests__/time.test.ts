// #region imports
    // #region internal
    import {
        now,
        stamp,
        delay,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * `time` is imported in five places across the repo. `now` is SECONDS, not milliseconds — the one
 * thing here a caller can silently get wrong by a factor of a thousand.
 */
describe('time', () => {
    it('`now` is the epoch in SECONDS, whole', () => {
        const before = Math.floor(Date.now() / 1000);
        const value = now();
        const after = Math.floor(Date.now() / 1000);

        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(before);
        expect(value).toBeLessThanOrEqual(after);
        // milliseconds would be a thousand times this
        expect(value).toBeLessThan(Date.now() / 100);
    });

    it('`stamp` is a readable time AND date, in that order', () => {
        const value = stamp();
        const [time, date] = value.split(' - ');

        expect(value).toContain(' - ');
        expect(time.length).toBeGreaterThan(0);
        expect(date.length).toBeGreaterThan(0);
        expect(new Date().toLocaleDateString()).toBe(date);
    });

    it('`delay` resolves only after the time it was given', async () => {
        jest.useFakeTimers();
        try {
            let resolved = false;
            const waiting = delay(500).then(() => { resolved = true; });

            await Promise.resolve();
            expect(resolved).toBe(false);

            jest.advanceTimersByTime(499);
            await Promise.resolve();
            expect(resolved).toBe(false);

            jest.advanceTimersByTime(1);
            await waiting;
            expect(resolved).toBe(true);
        } finally {
            jest.useRealTimers();
        }
    });

    it('`delay` with no argument waits the documented 500 ms', async () => {
        jest.useFakeTimers();
        try {
            let resolved = false;
            const waiting = delay().then(() => { resolved = true; });

            jest.advanceTimersByTime(499);
            await Promise.resolve();
            expect(resolved).toBe(false);

            jest.advanceTimersByTime(1);
            await waiting;
            expect(resolved).toBe(true);
        } finally {
            jest.useRealTimers();
        }
    });
});
// #endregion module
