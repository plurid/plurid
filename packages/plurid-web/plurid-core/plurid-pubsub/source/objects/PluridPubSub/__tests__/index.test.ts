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

    it('a callback that throws does not stop the bus', () => {
        const bus = new PluridPubSub();
        const after: number[] = [];
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {});

        bus.subscribe({ topic: 'space.rotateYWith', callback: () => { throw new Error('the host broke'); } });
        bus.subscribe({ topic: 'space.rotateYWith', callback: (data) => after.push((data as { value: number }).value) });

        expect(() => bus.publish({ topic: 'space.rotateYWith', data: { value: 3 } })).not.toThrow();
        expect(after).toEqual([3]);
        errors.mockRestore();
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
});
// #endregion module
