// #region imports
    // #region external
    import PluridPubSub from '../';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE BUS: a publish reaches every subscriber of that topic, with the data it was published with.
 * This used to be asserted as `expect(true).toBeTruthy()` after a publish (2026-09-13) — deleting the
 * whole `publish` implementation left the suite green. What follows asserts the delivery.
 */
describe('PluridPubSub', () => {
    it('delivers a publish to the subscriber, with its data', () => {
        const bus = new PluridPubSub();
        const received: unknown[] = [];

        bus.subscribe({
            topic: 'space.rotateYWith',
            callback: (data) => {
                received.push(data);
            },
        });

        bus.publish({
            topic: 'space.rotateYWith',
            data: { value: 1 },
        });

        expect(received).toEqual([{ value: 1 }]);
    });

    it('delivers to EVERY subscriber of the topic, and to no other topic', () => {
        const bus = new PluridPubSub();
        const first: number[] = [];
        const second: number[] = [];
        const other: number[] = [];

        bus.subscribe({ topic: 'space.rotateYWith', callback: (data) => first.push((data as { value: number }).value) });
        bus.subscribe({ topic: 'space.rotateYWith', callback: (data) => second.push((data as { value: number }).value) });
        bus.subscribe({ topic: 'space.rotateXWith', callback: (data) => other.push((data as { value: number }).value) });

        bus.publish({ topic: 'space.rotateYWith', data: { value: 7 } });
        bus.publish({ topic: 'space.rotateYWith', data: { value: 8 } });

        expect(first).toEqual([7, 8]);
        expect(second).toEqual([7, 8]);
        expect(other).toEqual([]);
    });

    it('an unsubscribed callback stops receiving; the others keep going', () => {
        const bus = new PluridPubSub();
        const leaving: number[] = [];
        const staying: number[] = [];

        const index = bus.subscribe({
            topic: 'space.rotateYWith',
            callback: (data) => leaving.push((data as { value: number }).value),
        });
        bus.subscribe({
            topic: 'space.rotateYWith',
            callback: (data) => staying.push((data as { value: number }).value),
        });

        bus.publish({ topic: 'space.rotateYWith', data: { value: 1 } });
        expect(bus.unsubscribe(index)).toBe(true);
        bus.publish({ topic: 'space.rotateYWith', data: { value: 2 } });

        expect(leaving).toEqual([1]);
        expect(staying).toEqual([1, 2]);
    });

    it('never hands out a selector twice: a stale unsubscribe cannot remove a newer subscriber', () => {
        const bus = new PluridPubSub();
        const newer: number[] = [];

        bus.subscribe({ topic: 'space.rotateYWith', callback: () => {} });
        const leaving = bus.subscribe({ topic: 'space.rotateYWith', callback: () => {} });
        expect(bus.unsubscribe(leaving)).toBe(true);
        const replacement = bus.subscribe({
            topic: 'space.rotateYWith',
            callback: (data) => newer.push((data as { value: number }).value),
        });

        expect(replacement).not.toBe(leaving);
        // a cleanup that runs twice removes nothing the second time
        expect(bus.unsubscribe(leaving)).toBe(false);
        bus.publish({ topic: 'space.rotateYWith', data: { value: 3 } });
        expect(newer).toEqual([3]);
    });

    it('a callback that throws does not stop the bus', () => {
        const bus = new PluridPubSub();
        const after: number[] = [];
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {});

        bus.subscribe({ topic: 'space.rotateYWith', callback: () => { throw new Error('the host broke'); } });
        bus.subscribe({ topic: 'space.rotateYWith', callback: (data) => after.push((data as { value: number }).value) });

        expect(() => bus.publish({ topic: 'space.rotateYWith', data: { value: 3 } })).not.toThrow();
        expect(after).toEqual([3]);
        // and it is not silent: in development the error is reported with its topic
        expect(errors).toHaveBeenCalledTimes(1);
        expect(String(errors.mock.calls[0][0])).toContain('space.rotateYWith');
        expect(errors.mock.calls[0][1]).toBeInstanceOf(Error);
        errors.mockRestore();
    });

    it('in production a throwing callback is not reported (unless debug)', () => {
        const previous = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
        try {
            const bus = new PluridPubSub();
            bus.subscribe({ topic: 'space.rotateYWith', callback: () => { throw new Error('quiet'); } });
            bus.publish({ topic: 'space.rotateYWith', data: { value: 1 } });
            expect(errors).not.toHaveBeenCalled();

            const debugging = new PluridPubSub({ debug: true });
            debugging.subscribe({ topic: 'space.rotateYWith', callback: () => { throw new Error('loud'); } });
            debugging.publish({ topic: 'space.rotateYWith', data: { value: 1 } });
            expect(errors).toHaveBeenCalledTimes(1);
        } finally {
            process.env.NODE_ENV = previous;
            errors.mockRestore();
        }
    });
});


describe('THE READINESS CONTRACT: a publish with no subscriber is dropped and reported', () => {
    let warnings: string[] = [];
    let warn: jest.SpyInstance;
    beforeEach(() => {
        warnings = [];
        warn = jest.spyOn(console, 'warn').mockImplementation((message: string) => { warnings.push(String(message)); });
    });
    afterEach(() => {
        warn.mockRestore();
    });

    it('warns once per topic in development, naming the topic', () => {
        const bus = new PluridPubSub();
        bus.publish({ topic: 'space.rotateYWith', data: { value: 1 } });
        bus.publish({ topic: 'space.rotateYWith', data: { value: 2 } });
        bus.publish({ topic: 'space.fitToView' });
        expect(warnings).toHaveLength(2);
        expect(warnings[0]).toContain("'space.rotateYWith'");
        expect(warnings[1]).toContain("'space.fitToView'");
    });

    it('never warns for a topic the engine emits, nor once a subscriber exists', () => {
        const bus = new PluridPubSub();
        bus.publish({ topic: 'space.changed', data: { kind: 'tree', value: [] } as any });
        bus.publish({ topic: 'space.collaborationMutation', data: {} as any });
        bus.subscribe({ topic: 'space.fitToView', callback: () => {} });
        bus.publish({ topic: 'space.fitToView' });
        expect(warnings).toHaveLength(0);
    });

    it('onDrop: null silences; a function replaces the warning; a throwing hook never breaks the publish', () => {
        const silent = new PluridPubSub({ onDrop: null });
        silent.publish({ topic: 'space.fitToView' });
        expect(warnings).toHaveLength(0);

        const seen: string[] = [];
        const reported = new PluridPubSub({ onDrop: (topic) => { seen.push(topic); } });
        reported.publish({ topic: 'space.fitToView' });
        reported.publish({ topic: 'space.fitToView' });
        expect(seen).toEqual(['space.fitToView', 'space.fitToView']);
        expect(warnings).toHaveLength(0);

        const throwing = new PluridPubSub({ onDrop: () => { throw new Error('boom'); } });
        expect(() => throwing.publish({ topic: 'space.fitToView' })).not.toThrow();
    });

    it('a subscriber another one removed during the publish is not called (2026-10-20)', () => {
        // The publish walked a copy of the subscribers taken before the first ran, so one that the
        // first unsubscribed still received the message.
        const pubsub = new PluridPubSub();
        const second = jest.fn();
        let secondSelector = '';
        pubsub.subscribe({ topic: 'space.fitToView', callback: () => { pubsub.unsubscribe(secondSelector); } });
        secondSelector = pubsub.subscribe({ topic: 'space.fitToView', callback: second });
        const third = jest.fn();
        pubsub.subscribe({ topic: 'space.fitToView', callback: third });
        pubsub.publish({ topic: 'space.fitToView' });
        expect(second).not.toHaveBeenCalled();
        expect(third).toHaveBeenCalledTimes(1);
    });

    it('a host\'s onDrop is not told about the topics the engine emits, as the warning is not (2026-10-20)', () => {
        // It replaces the warning, which skips them (nobody has to listen to them); it was called for
        // every `space.changed` an application published with no host listening.
        const seen: string[] = [];
        const reported = new PluridPubSub({ onDrop: (topic) => { seen.push(topic); } });
        reported.publish({ topic: 'space.changed', data: { kind: 'camera' } } as any);
        reported.publish({ topic: 'space.fitToView' });
        expect(seen).toEqual(['space.fitToView']);
    });
});
// #endregion module
