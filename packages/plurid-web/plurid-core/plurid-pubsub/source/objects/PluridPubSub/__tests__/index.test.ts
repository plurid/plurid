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
// #endregion module
