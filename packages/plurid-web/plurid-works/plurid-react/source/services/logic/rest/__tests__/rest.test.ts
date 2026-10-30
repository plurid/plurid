// #region imports
    // #region external
    import {
        actions,
    } from '~services/state/modules/space';

    import {
        treePlane,
        configurationWith,
    } from '../../../../testing/fixtures';
    import {
        makeSpaceStore,
    } from '../../../../testing/store';
    // #endregion external


    // #region internal
    import {
        waitForRest,
        whenAtRest,
    } from '..';
    // #endregion internal
// #endregion imports



// #region module
describe('the space at rest', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });

    it('is three still frames in a row', async () => {
        const store = makeSpaceStore(configurationWith({}), [treePlane('a')]);
        let rested: boolean | undefined;
        void whenAtRest(store).then((value) => {
            rested = value;
        });
        await jest.advanceTimersByTimeAsync(16 * 2);
        expect(rested).toBeUndefined();
        await jest.advanceTimersByTimeAsync(16 * 2);
        expect(rested).toBe(true);
    });

    it('waits through a tween and a relayout\'s glide, and gives up after its timeout', async () => {
        const store = makeSpaceStore(configurationWith({}), [treePlane('a')]);
        store.dispatch(actions.setMotion('tween'));
        let rested: boolean | undefined;
        void waitForRest(store, 200).then((value) => {
            rested = value;
        });
        await jest.advanceTimersByTimeAsync(400);
        expect(rested).toBe(false);

        store.dispatch(actions.setMotion('idle'));
        store.dispatch(actions.setSpaceField({ field: 'layoutTransition', value: 380 } as any));
        rested = undefined;
        void whenAtRest(store, { timeout: 1000, frames: 2 }).then((value) => {
            rested = value;
        });
        await jest.advanceTimersByTimeAsync(100);
        expect(rested).toBeUndefined();
        store.dispatch(actions.setSpaceField({ field: 'layoutTransition', value: 0 } as any));
        await jest.advanceTimersByTimeAsync(100);
        expect(rested).toBe(true);
    });

    it('reads a timeout or a frame count it cannot use as the default: a NaN timeout runs out, 0 frames is 3', async () => {
        const store = makeSpaceStore(configurationWith({}), [treePlane('a')]);
        store.dispatch(actions.setMotion('tween'));
        let rested: boolean | undefined;
        void whenAtRest(store, { timeout: Number.NaN }).then((value) => {
            rested = value;
        });
        await jest.advanceTimersByTimeAsync(3900);
        expect(rested).toBeUndefined();
        await jest.advanceTimersByTimeAsync(300);
        expect(rested).toBe(false);

        store.dispatch(actions.setMotion('idle'));
        rested = undefined;
        void whenAtRest(store, { frames: 0, timeout: -5 }).then((value) => {
            rested = value;
        });
        await jest.advanceTimersByTimeAsync(16 * 2);
        expect(rested).toBeUndefined();
        await jest.advanceTimersByTimeAsync(16 * 2);
        expect(rested).toBe(true);
    });

    it('A CAMERA THAT CHANGED IS MOVING, whatever the motion says: a wheel\'s tail, the arrow keys', async () => {
        const store = makeSpaceStore(configurationWith({}), [treePlane('a')]);
        let rested: boolean | undefined;
        void whenAtRest(store, { timeout: 5000 }).then((value) => {
            rested = value;
        });
        for (let frame = 0; frame < 20; frame += 1) {
            store.dispatch(actions.applyCameraDelta({ yaw: 1 }));
            await jest.advanceTimersByTimeAsync(16);
        }
        expect(rested).toBeUndefined();
        expect(store.space().motion).toBe('idle');
        await jest.advanceTimersByTimeAsync(16 * 4);
        expect(rested).toBe(true);
    });
});
// #endregion module
