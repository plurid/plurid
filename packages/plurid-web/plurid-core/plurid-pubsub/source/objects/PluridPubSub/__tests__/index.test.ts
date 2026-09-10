// #region imports
    // #region external
    import PluridPubSub from '../';
    // #endregion external
// #endregion imports



// #region module
describe('PluridPubSub', () => {
    it('publishes and subscribes', () => {
        const pluridPubSub = new PluridPubSub();

        pluridPubSub.subscribe({
            topic: 'space.rotateYWith',
            callback: data => {
                const {
                    value,
                } = data;

                // increase the rotateY with value
                // console.log('called topic space.rotateYWith with value:', value);
            },
        });

        pluridPubSub.publish({
            topic: 'space.rotateYWith',
            data: { value: 1 },
        });

        expect(true).toBeTruthy();
    });

    it('subscribes and unsubscribes', () => {
        const pluridPubSub = new PluridPubSub();

        const index = pluridPubSub.subscribe({
            topic: 'space.rotateYWith',
            callback: data => {
                const {
                    value,
                } = data;

                // increase the rotateY with value
                // console.log('called topic space.rotateYWith with value:', value);
            },
        });

        pluridPubSub.publish({
            topic: 'space.rotateYWith',
            data: { value: 1 },
        });

        const unsubscribed = pluridPubSub.unsubscribe(
            index,
        );

        expect(unsubscribed).toBe(true);
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
